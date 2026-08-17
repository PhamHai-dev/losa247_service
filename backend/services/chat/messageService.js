const crypto = require('crypto');
const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');

const createEventId = () => crypto.randomUUID();

const createCustomerMessage = async ({ sessionId, clientMessageId, content = '', attachmentIds = [] }) => {
  if (!sessionId || !clientMessageId) throw Object.assign(new Error('Thiếu sessionId/clientMessageId'), { code: 'INVALID_MESSAGE' });
  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.chatMessage.findUnique({ where: { sessionId_clientMessageId: { sessionId, clientMessageId } }, include: { attachmentRows: true } });
    if (duplicate) return { message: duplicate, duplicate: true };
    const session = await tx.chatSession.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'open') throw Object.assign(new Error('Phiên chat không tồn tại'), { code: 'SESSION_NOT_FOUND' });
    if (attachmentIds.length) {
      const count = await tx.chatAttachment.count({ where: { id: { in: attachmentIds }, sessionId, messageId: null } });
      if (count !== attachmentIds.length) throw Object.assign(new Error('Attachment không hợp lệ'), { code: 'INVALID_ATTACHMENT' });
    }
    const message = await tx.chatMessage.create({ data: { id: createEntityId(), sessionId, clientMessageId, sender: 'customer', content, messageType: attachmentIds.length ? (content ? 'mixed' : 'image') : 'text', attachments: [], status: 'sent' } });
    if (attachmentIds.length) await tx.chatAttachment.updateMany({ where: { id: { in: attachmentIds } }, data: { messageId: message.id } });
    const eventId = createEventId();
    await tx.automationOutbox.create({ data: { id: createEntityId(), eventId, eventType: 'chat.message.received', aggregateType: 'ChatMessage', aggregateId: message.id, sessionId, payload: { sessionId, messageId: message.id } } });
    const now = new Date();
    await tx.chatSession.update({ where: { id: sessionId }, data: { lastMessageAt: now, lastCustomerMessageAt: now, ...(session.mode === 'bot' ? { automationStatus: 'debouncing' } : {}) } });
    return { message, duplicate: false, eventId };
  });
};

module.exports = { createCustomerMessage, createEventId };
