const { prisma } = require('../../config/prisma');
const { createAuthenticatedUrl } = require('../../helpers/upload');

const mapAttachment = (attachment) => ({
  id: attachment.id,
  url: createAuthenticatedUrl(attachment),
  mimeType: attachment.mimeType,
  width: attachment.width,
  height: attachment.height,
  size: Number(attachment.size),
});

const mapMessage = (message) => ({
  id: message.id,
  sender: message.sender,
  content: message.content,
  messageType: message.messageType,
  createdAt: message.createdAt,
  attachments: (message.attachmentRows || []).filter((item) => item.scanStatus === 'clean').map(mapAttachment),
});

const buildAIContext = async (sessionId, batchId, recentLimit = 20) => {
  const [session, batch, recentMessages] = await Promise.all([
    prisma.chatSession.findUnique({ where: { id: sessionId }, select: { id: true, version: true, mode: true, summary: true, context: true, customerName: true, customerPhone: true } }),
    prisma.chatBatch.findFirst({ where: { id: batchId, sessionId }, include: { messages: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], include: { attachmentRows: true } } } }),
    prisma.chatMessage.findMany({ where: { sessionId, NOT: { batchId } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: Math.min(Math.max(recentLimit, 10), 30), include: { attachmentRows: true } }),
  ]);
  if (!session || !batch) throw Object.assign(new Error('Không tìm thấy session/batch'), { code: 'BATCH_NOT_FOUND' });
  return { summary: session.summary || '', recentMessages: recentMessages.reverse().map(mapMessage), currentBatch: batch.messages.map(mapMessage), sessionContext: { ...(session.context || {}), customer: { name: session.customerName, phone: session.customerPhone } } };
};

const getMessagesCursor = async (sessionId, { cursor, limit = 30 } = {}) => {
  const take = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const rows = await prisma.chatMessage.findMany({ where: { sessionId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: take + 1, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), include: { attachmentRows: true } });
  const hasMore = rows.length > take;
  const data = hasMore ? rows.slice(0, take) : rows;
  return { data: data.reverse().map((message) => ({ ...message, attachmentRows: undefined, attachments: (message.attachmentRows || []).map((item) => createAuthenticatedUrl(item)) })), nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
};

module.exports = { buildAIContext, getMessagesCursor };
