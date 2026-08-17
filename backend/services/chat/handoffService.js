const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { createEventId } = require('./messageService');

const transition = async ({ sessionId, expectedVersion, fromMode, toMode, adminId, reason, note }) => prisma.$transaction(async (tx) => {
  const updated = await tx.chatSession.updateMany({
    where: { id: sessionId, mode: fromMode, version: expectedVersion, ...(fromMode === 'human' ? { OR: [{ assignedAdminId: adminId }, { assignedAdminId: null }] } : {}) },
    data: { mode: toMode, version: { increment: 1 }, assignedAdminId: toMode === 'human' ? adminId : null, automationStatus: 'idle', ...(toMode === 'human' ? { handoffAt: new Date() } : { botResumedAt: new Date(), summary: note || undefined }) },
  });
  if (updated.count !== 1) {
    const current = await tx.chatSession.findUnique({ where: { id: sessionId } });
    const code = !current ? 'SESSION_NOT_FOUND' : current.version !== expectedVersion ? 'STALE_SESSION_VERSION' : 'SESSION_ALREADY_TAKEN';
    throw Object.assign(new Error(code), { code, current });
  }
  const session = await tx.chatSession.findUnique({ where: { id: sessionId } });
  await tx.chatHandoff.create({ data: { id: createEntityId(), sessionId, fromMode, toMode, fromVersion: expectedVersion, toVersion: session.version, reason, actorType: 'admin', actorId: adminId, note: note || null } });
  const eventId = createEventId();
  await tx.automationOutbox.create({ data: { id: createEntityId(), eventId, eventType: toMode === 'bot' ? 'chat.bot.resumed' : 'chat.human.takeover', aggregateType: 'ChatSession', aggregateId: sessionId, sessionId, payload: { sessionId, version: session.version, adminId, reason } } });
  return session;
});

const takeover = (args) => transition({ ...args, fromMode: 'bot', toMode: 'human', reason: args.reason || 'admin_takeover' });
const release = (args) => transition({ ...args, fromMode: 'human', toMode: 'bot', reason: args.reason || 'manual_release' });

module.exports = { takeover, release };
