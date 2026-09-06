const crypto = require('crypto');
const env = require('../../config/env');

const subscribers = new Map();
const keyFor = (scope, id) => `${scope}:${id}`;
const writeEvent = (res, event) => {
  res.write(`id: ${event.id}\n`);
  res.write(`event: ${event.type}\n`);
  res.write(`data: ${JSON.stringify(event)}\n\n`);
};

const subscribe = ({ req, res, scope, principalId, principalIds }) => {
  const ids = [...new Set((principalIds || [principalId]).map(String))];
  const registrations = ids.map((id) => {
    const key = keyFor(scope, id);
    return { key, connections: subscribers.get(key) || new Set() };
  });
  if (registrations.some(({ connections }) => connections.size >= env.SSE_MAX_CONNECTIONS_PER_PRINCIPAL)) {
    res.status(429).json({ success: false, error: { code: 'SSE_CONNECTION_LIMIT', message: 'Quá nhiều kết nối realtime' } });
    return;
  }
  res.status(200);
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.flushHeaders?.();
  const connection = { id: crypto.randomUUID(), res };
  registrations.forEach(({ key, connections }) => {
    connections.add(connection);
    subscribers.set(key, connections);
  });
  writeEvent(res, { id: crypto.randomUUID(), type: 'stream.connected', occurredAt: new Date().toISOString(), data: { scope } });
  const heartbeat = setInterval(() => res.write(`: heartbeat ${Date.now()}\n\n`), env.SSE_HEARTBEAT_MS);
  const cleanup = () => {
    clearInterval(heartbeat);
    registrations.forEach(({ key, connections }) => {
      connections.delete(connection);
      if (!connections.size) subscribers.delete(key);
    });
  };
  req.on('close', cleanup);
};

const deliver = (event) => {
  const targets = event.type === 'notification.created'
    ? [keyFor('notification', event.data?.recipientId || 'all')]
    : [keyFor('session', event.sessionId), keyFor('admin', 'all')];
  targets.forEach((key) => subscribers.get(key)?.forEach(({ res }) => writeEvent(res, event)));
};

module.exports = { subscribe, deliver };
