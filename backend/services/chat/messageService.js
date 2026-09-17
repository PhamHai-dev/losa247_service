const crypto = require('crypto');
const { Prisma } = require('@prisma/client');
const { prisma } = require('../../config/prisma');
const env = require('../../config/env');
const { createEntityId } = require('../../repositories/core/entityId');
const { codePointLength } = require('./chatLimitUtils');
const { incrementCycleCounters } = require('./sessionLimitService');

const createEventId = () => crypto.randomUUID();

const createCustomerMessage = async ({ sessionId, clientMessageId, content = '', attachmentIds = [] }) => {
  if (!sessionId || !clientMessageId) throw Object.assign(new Error('Thiếu sessionId/clientMessageId'), { statusCode: 400, code: 'INVALID_MESSAGE' });
  if (codePointLength(content) > env.CHAT_CUSTOMER_MESSAGE_MAX_CHARS) {
    throw Object.assign(new Error(`Tin nhắn tối đa ${env.CHAT_CUSTOMER_MESSAGE_MAX_CHARS.toLocaleString('vi-VN')} ký tự`), { statusCode: 400, code: 'MESSAGE_TOO_LONG' });
  }
  if (!content && !attachmentIds.length) throw Object.assign(new Error('Tin nhắn không được để trống'), { statusCode: 400, code: 'EMPTY_MESSAGE' });

  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.chatMessage.findUnique({ where: { sessionId_clientMessageId: { sessionId, clientMessageId } }, include: { attachmentRows: true } });
    if (duplicate) return { message: duplicate, duplicate: true, limitReached: false };
    const session = await tx.chatSession.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'open') throw Object.assign(new Error('Phiên chat không tồn tại'), { statusCode: 404, code: 'SESSION_NOT_FOUND' });
    if (attachmentIds.length) {
      const count = await tx.chatAttachment.count({ where: { id: { in: attachmentIds }, sessionId, messageId: null } });
      if (count !== attachmentIds.length) throw Object.assign(new Error('Attachment không hợp lệ'), { statusCode: 400, code: 'INVALID_ATTACHMENT' });
    }

    const message = await tx.chatMessage.create({ data: { id: createEntityId(), sessionId, clientMessageId, botCycle: session.botCycle, sender: 'customer', content, messageType: attachmentIds.length ? (content ? 'mixed' : 'image') : 'text', attachments: [], status: 'sent' } });
    if (attachmentIds.length) await tx.chatAttachment.updateMany({ where: { id: { in: attachmentIds } }, data: { messageId: message.id } });

    const limit = await incrementCycleCounters(tx, { session, content, attachmentCount: attachmentIds.length });
    let eventId = null;
    if (limit.automationAllowed) {
      eventId = createEventId();
      await tx.automationOutbox.create({ data: { id: createEntityId(), eventId, eventType: 'chat.message.received', aggregateType: 'ChatMessage', aggregateId: message.id, sessionId, payload: { sessionId, messageId: message.id, botCycle: session.botCycle } } });
    }
    const now = new Date();
    await tx.chatSession.update({ where: { id: sessionId }, data: { lastMessageAt: now, lastCustomerMessageAt: now, ...(limit.automationAllowed ? { automationStatus: 'debouncing' } : {}) } });
    const completeMessage = await tx.chatMessage.findUnique({ where: { id: message.id }, include: { attachmentRows: true } });
    return { message: completeMessage, duplicate: false, eventId, limitReached: limit.limitReached, session: limit.session };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
};

module.exports = { createCustomerMessage, createEventId };
