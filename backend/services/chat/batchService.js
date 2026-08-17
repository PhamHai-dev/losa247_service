const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { createEventId } = require('./messageService');

const ACTIVE = ['pending', 'queued', 'processing'];

const createNextBatch = async (sessionId) => prisma.$transaction(async (tx) => {
  const session = await tx.chatSession.findUnique({ where: { id: sessionId } });
  if (!session) throw Object.assign(new Error('Phiên chat không tồn tại'), { code: 'SESSION_NOT_FOUND' });
  if (session.mode !== 'bot') return { ignored: true, reason: 'BOT_DISABLED' };
  const active = await tx.chatBatch.findFirst({ where: { sessionId, status: { in: ACTIVE } }, orderBy: { createdAt: 'asc' } });
  if (active) return { deferred: true, batch: active };
  const messages = await tx.chatMessage.findMany({ where: { sessionId, sender: 'customer', batchId: null }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
  if (!messages.length) {
    await tx.chatSession.update({ where: { id: sessionId }, data: { automationStatus: 'idle' } });
    return { empty: true };
  }
  const batch = await tx.chatBatch.create({ data: { id: createEntityId(), sessionId, sessionVersion: session.version, eventId: createEventId(), status: 'queued' } });
  await tx.chatMessage.updateMany({ where: { id: { in: messages.map((item) => item.id) }, batchId: null }, data: { batchId: batch.id, status: 'queued' } });
  await tx.chatSession.update({ where: { id: sessionId }, data: { automationStatus: 'queued' } });
  return { batch: { ...batch, messages } };
});

const markProcessing = (batchId) => prisma.chatBatch.update({ where: { id: batchId }, data: { status: 'processing', startedAt: new Date(), session: { update: { automationStatus: 'processing' } } } });
const markFailed = (batchId, error) => prisma.chatBatch.update({ where: { id: batchId }, data: { status: 'failed', failedAt: new Date(), lastError: String(error?.message || error), session: { update: { automationStatus: 'failed' } } } });

module.exports = { createNextBatch, markProcessing, markFailed };
