const crypto = require('crypto');
const { prisma } = require('../config/prisma');
const { createEntityId } = require('../repositories/core/entityId');
const { toLegacyEntity } = require('../repositories/core/legacyMapper');
const { verifyToken } = require('../helpers/token');
const { createCustomerMessage } = require('../services/chat/messageService');
const { takeover } = require('../services/chat/handoffService');

const authorizeAdmin = async (socket, permission) => {
  const raw = socket.handshake.auth?.token;
  if (!raw) return null;
  try {
    const decoded = verifyToken(raw, 'admin', 'access');
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { role: true } });
    if (!user || user.status !== 'active' || user.roleName === 'customer' || !user.role) return null;
    const permissions = user.role.name === 'admin' ? ['*'] : Array.isArray(user.role.permissions) ? user.role.permissions : [];
    return permissions.includes('*') || permissions.includes(permission) ? user : null;
  } catch { return null; }
};

const normalizeAttachments = (attachments) => (Array.isArray(attachments) ? attachments : []).map((item) => typeof item === 'string' ? { url: item } : item).filter(Boolean);

module.exports = (io) => {
  const chatNs = io.of('/chat');
  chatNs.on('connection', (socket) => {
    socket.on('join_session', ({ sessionId }) => { if (sessionId) socket.join(sessionId); });

    socket.on('customer_message', async (payload = {}, acknowledge) => {
      try {
        const attachments = normalizeAttachments(payload.attachments);
        const attachmentIds = attachments.map((item) => item.id).filter(Boolean);
        const result = await createCustomerMessage({ sessionId: payload.sessionId, clientMessageId: payload.clientMessageId || crypto.randomUUID(), content: String(payload.content || '').trim(), attachmentIds });
        const responseMessage = { ...toLegacyEntity(result.message), attachments: attachments.map((item) => item.url).filter(Boolean) };
        if (!result.duplicate) chatNs.to(payload.sessionId).emit('new_message', responseMessage);
        return acknowledge?.({ success: true, duplicate: result.duplicate, data: responseMessage });
      } catch (error) {
        console.error('Lỗi khi gửi tin nhắn khách hàng:', error);
        return acknowledge?.({ success: false, error: { code: error.code || 'INTERNAL_ERROR' } });
      }
    });

    socket.on('request_human', async ({ sessionId }, acknowledge) => {
      try {
        const current = await prisma.chatSession.findUnique({ where: { id: sessionId } });
        if (!current) return acknowledge?.({ success: false, error: { code: 'SESSION_NOT_FOUND' } });
        if (current.mode === 'human') return acknowledge?.({ success: true, data: toLegacyEntity(current) });
        const session = await takeover({ sessionId, expectedVersion: current.version, adminId: null, reason: 'customer_request' });
        const response = toLegacyEntity(session);
        chatNs.to(sessionId).emit('session_mode_changed', { mode: 'human', version: session.version });
        io.of('/notifications').emit('new_human_request', { sessionId, session: response });
        return acknowledge?.({ success: true, data: response });
      } catch (error) { return acknowledge?.({ success: false, error: { code: error.code || 'INTERNAL_ERROR' } }); }
    });

    socket.on('admin_message', async (payload = {}, acknowledge) => {
      try {
        const user = await authorizeAdmin(socket, 'chat.reply');
        if (!user) {
          acknowledge?.({ success: false, error: { code: 'MISSING_PERMISSION', permission: 'chat.reply' } });
          return socket.emit('permission_error', { permission: 'chat.reply' });
        }
        const attachments = normalizeAttachments(payload.attachments);
        const message = await prisma.$transaction(async (tx) => {
          const session = await tx.chatSession.findFirst({ where: { id: payload.sessionId, mode: 'human', OR: [{ assignedAdminId: user.id }, { assignedAdminId: null }] } });
          if (!session) throw Object.assign(new Error('Admin chưa tiếp quản phiên'), { code: 'HUMAN_MODE_REQUIRED' });
          if (!session.assignedAdminId) await tx.chatSession.update({ where: { id: session.id }, data: { assignedAdminId: user.id } });
          const created = await tx.chatMessage.create({ data: { id: createEntityId(), sessionId: session.id, sender: 'admin', content: String(payload.content || '').trim(), attachments: attachments.map((item) => item.url).filter(Boolean), status: 'sent' } });
          await tx.chatSession.update({ where: { id: session.id }, data: { lastMessageAt: new Date(), lastReplyAt: new Date() } });
          return created;
        });
        const response = toLegacyEntity(message);
        chatNs.to(payload.sessionId).emit('new_message', response);
        return acknowledge?.({ success: true, data: response });
      } catch (error) {
        console.error('Lỗi khi gửi tin nhắn admin:', error);
        return acknowledge?.({ success: false, error: { code: error.code || 'INTERNAL_ERROR' } });
      }
    });
  });
};
