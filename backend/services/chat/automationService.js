const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const env = require('../../config/env');
const { sign } = require('./webhookSecurityService');

const normalizePhone = (value) => value ? String(value).replace(/[^\d+]/g, '') : null;
const normalizeEmail = (value) => value ? String(value).trim().toLowerCase() : null;

const processActions = async (tx, command, messageId) => {
  const actions = Array.isArray(command.payload.metadata?.actions) ? command.payload.metadata.actions.slice(0, 5) : [];
  for (const action of actions) {
    const payload = action?.payload || {};
    if (action?.type === 'lead.upsert') {
      const phoneNormalized = normalizePhone(payload.phone);
      const emailNormalized = normalizeEmail(payload.email);
      const existing = await tx.lead.findFirst({ where: { chatSessionId: command.sessionId, OR: [{ sourceMessageId: messageId }, ...(phoneNormalized ? [{ phoneNormalized }] : []), ...(emailNormalized ? [{ emailNormalized }] : [])] } });
      const data = { name: payload.name || undefined, phone: payload.phone || undefined, email: payload.email || undefined, phoneNormalized, emailNormalized, score: payload.score, temperature: payload.temperature, detectedBy: 'ai', chatSessionId: command.sessionId, sourceMessageId: messageId };
      const lead = existing ? await tx.lead.update({ where: { id: existing.id }, data }) : await tx.lead.create({ data: { id: createEntityId(), ...data, source: 'chat', status: 'new', notes: [] } });
      await tx.notification.create({ data: { id: createEntityId(), title: 'Lead từ chatbot', message: `${lead.name || lead.phone || lead.email || 'Khách hàng'} cần được tư vấn.`, type: 'lead', link: '/admin/leads' } });
    } else if (action?.type === 'notification.create') {
      await tx.notification.create({ data: { id: createEntityId(), title: payload.title, message: payload.message, type: 'alert', link: `/admin/chat?session=${command.sessionId}` } });
    } else if (action?.type === 'handoff.request') {
      await tx.chatSession.updateMany({ where: { id: command.sessionId, mode: 'bot', version: command.expectedVersion }, data: { mode: 'human', version: { increment: 1 }, handoffAt: new Date(), automationStatus: 'idle' } });
      await tx.chatHandoff.create({ data: { id: createEntityId(), sessionId: command.sessionId, fromMode: 'bot', toMode: 'human', fromVersion: command.expectedVersion, toVersion: command.expectedVersion + 1, reason: 'ai_handoff', actorType: 'automation', note: payload.reason } });
    }
  }
};

const sendBatchToN8n = async ({ batch, context }) => {
  const body = JSON.stringify({ schemaVersion: '1.0', eventId: batch.eventId, eventType: 'chat.batch.ready', occurredAt: new Date().toISOString(), batch: { id: batch.id, sessionId: batch.sessionId, sessionVersion: batch.sessionVersion }, context, callbackUrl: env.N8N_CALLBACK_URL });
  const timestamp = String(Date.now());
  const response = await fetch(env.N8N_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json', 'x-event-id': batch.eventId, 'x-timestamp': timestamp, 'x-signature': sign(body, timestamp) }, body, signal: AbortSignal.timeout(env.N8N_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`N8N_HTTP_${response.status}`);
  return response.text();
};

const processChatReply = async (command) => prisma.$transaction(async (tx) => {
  const old = await tx.webhookInbox.findUnique({ where: { eventId: command.eventId } });
  if (old?.status === 'completed') return { duplicate: true, response: old.responseBody };
  if (!old) await tx.webhookInbox.create({ data: { id: createEntityId(), eventId: command.eventId, correlationId: command.correlationId, direction: 'inbound', command: command.command } });
  const guarded = await tx.chatSession.updateMany({ where: { id: command.sessionId, mode: 'bot', version: command.expectedVersion }, data: { lastReplyAt: new Date(), lastMessageAt: new Date() } });
  if (guarded.count !== 1) {
    const current = await tx.chatSession.findUnique({ where: { id: command.sessionId } });
    const code = current?.mode !== 'bot' ? 'BOT_DISABLED' : 'STALE_SESSION_VERSION';
    throw Object.assign(new Error(code), { code, current });
  }
  const message = await tx.chatMessage.create({ data: { id: createEntityId(), sessionId: command.sessionId, batchId: command.batchId || null, sender: 'bot', content: command.payload.content, attachments: command.payload.attachments || [], metadata: command.payload.metadata || null, status: 'sent' } });
  if (command.batchId) await tx.chatBatch.update({ where: { id: command.batchId }, data: { status: 'completed', completedAt: new Date() } });
  await tx.chatSession.update({ where: { id: command.sessionId }, data: { automationStatus: 'idle' } });
  await processActions(tx, command, message.id);
  const response = { success: true, data: message };
  await tx.webhookInbox.update({ where: { eventId: command.eventId }, data: { status: 'completed', responseCode: 200, responseBody: response, processedAt: new Date() } });
  return response;
});

module.exports = { sendBatchToN8n, processChatReply };
