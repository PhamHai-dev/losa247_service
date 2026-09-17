const env = require('../../config/env');
const { createEntityId } = require('../../repositories/core/entityId');
const { customerMessageUnits } = require('./chatLimitUtils');

const getMessageUnits = (content, attachmentCount) => customerMessageUnits(
  content,
  attachmentCount,
  env.CHAT_ATTACHMENT_CONTEXT_UNITS,
);

const incrementCycleCounters = async (tx, { session, content, attachmentCount }) => {
  if (session.mode !== 'bot' || session.cycleLimitReachedAt) {
    return { session, limitReached: false, automationAllowed: false };
  }

  const units = getMessageUnits(content, attachmentCount);
  await tx.chatSession.update({
    where: { id: session.id },
    data: {
      cycleCustomerMessageCount: { increment: 1 },
      cycleCustomerUnits: { increment: units },
    },
  });
  const counted = await tx.chatSession.findUnique({ where: { id: session.id } });
  const limitReached = counted.cycleCustomerMessageCount >= env.CHAT_CYCLE_MAX_CUSTOMER_MESSAGES
    || counted.cycleCustomerUnits >= env.CHAT_CYCLE_MAX_UNITS;
  if (!limitReached) return { session: counted, limitReached: false, automationAllowed: true, units };

  const now = new Date();
  const transitioned = await tx.chatSession.updateMany({
    where: { id: session.id, mode: 'bot', cycleLimitReachedAt: null, botCycle: session.botCycle },
    data: {
      mode: 'human',
      automationStatus: 'idle',
      assignedAdminId: null,
      handoffAt: now,
      cycleLimitReachedAt: now,
      version: { increment: 1 },
    },
  });
  const current = await tx.chatSession.findUnique({ where: { id: session.id } });
  if (transitioned.count === 1) {
    await tx.chatHandoff.create({
      data: {
        id: createEntityId(),
        sessionId: session.id,
        fromMode: 'bot',
        toMode: 'human',
        fromVersion: session.version,
        toVersion: current.version,
        reason: 'context_limit',
        actorType: 'system',
        metadata: {
          botCycle: session.botCycle,
          customerMessageCount: current.cycleCustomerMessageCount,
          customerUnits: current.cycleCustomerUnits,
        },
      },
    });
    await tx.notification.create({
      data: {
        id: createEntityId(),
        title: 'Cuộc trò chuyện cần tư vấn viên',
        message: `Phiên ${session.id} đã đạt giới hạn context và được chuyển sang chế độ nhân viên.`,
        type: 'alert',
        link: '/admin/chat',
      },
    });
  }
  return { session: current, limitReached: true, automationAllowed: false, units, transitioned: transitioned.count === 1 };
};

module.exports = { getMessageUnits, incrementCycleCounters };
