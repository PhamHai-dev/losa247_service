const crypto = require('crypto');
const env = require('../../config/env');
const { getReadyClient } = require('../../config/redis');
const { deliver } = require('./sseHub');

const CHANNEL = `${env.CHAT_QUEUE_PREFIX}:realtime`;
let subscriber;
let initializing;

const init = async () => {
  if (!env.REALTIME_REDIS_ENABLED || subscriber?.isReady) return subscriber;
  if (initializing) return initializing;
  initializing = (async () => {
    const client = await getReadyClient();
    if (!client) return null;
    subscriber = client.duplicate();
    subscriber.on('error', (error) => console.error('[Realtime] Redis subscriber error:', error.message));
    await subscriber.connect();
    await subscriber.subscribe(CHANNEL, (raw) => {
      try { deliver(JSON.parse(raw)); } catch (error) { console.error('[Realtime] Invalid event:', error.message); }
    });
    return subscriber;
  })().finally(() => { initializing = null; });
  return initializing;
};

const publish = async ({ type, sessionId = null, data = {} }) => {
  const event = { id: crypto.randomUUID(), type, sessionId, occurredAt: new Date().toISOString(), data };
  const client = env.REALTIME_REDIS_ENABLED ? await getReadyClient() : null;
  if (client?.isReady) await client.publish(CHANNEL, JSON.stringify(event));
  else deliver(event);
  return event;
};

module.exports = { init, publish };
