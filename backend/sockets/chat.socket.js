const jwt = require('jsonwebtoken');
const ChatSession = require('../models/ChatSession.model');
const ChatMessage = require('../models/ChatMessage.model');
const User = require('../models/User.model');
const Role = require('../models/Role.model');
const env = require('../config/env');
const n8nHelper = require('../helpers/n8n');

const authorizeAdmin = async (socket, permission) => {
  const token = socket.handshake.auth?.token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env.JWT_ADMIN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'active' || user.role === 'customer') return null;
    const role = await Role.findOne({ name: String(user.role).trim().toLowerCase() });
    if (!role) return null;
    const permissions = role.name === 'admin' ? ['*'] : (Array.isArray(role.permissions) ? role.permissions : []);
    return permissions.includes('*') || permissions.includes(permission) ? user : null;
  } catch {
    return null;
  }
};

module.exports = (io) => {
  const chatNs = io.of('/chat');

  chatNs.on('connection', (socket) => {
    socket.on('join_session', ({ sessionId }) => {
      if (sessionId) socket.join(sessionId);
    });

    socket.on('customer_message', async ({ sessionId, content, attachments = [] }) => {
      try {
        const session = await ChatSession.findById(sessionId);
        if (!session) return;
        const message = new ChatMessage({ sessionId, sender: 'customer', content, attachments });
        await message.save();
        session.lastMessageAt = new Date();
        await session.save();
        chatNs.to(sessionId).emit('new_message', message);
        if (session.mode === 'bot') await n8nHelper.forwardChatMessage(sessionId, message);
      } catch (err) {
        console.error('Lỗi khi gửi tin nhắn khách hàng:', err);
      }
    });

    socket.on('request_human', async ({ sessionId }) => {
      try {
        const session = await ChatSession.findById(sessionId);
        if (!session) return;
        session.mode = 'human';
        await session.save();
        chatNs.to(sessionId).emit('session_mode_changed', { mode: 'human' });
        io.of('/notifications').emit('new_human_request', { sessionId, session });
      } catch (err) {
        console.error('Lỗi khi yêu cầu người thật:', err);
      }
    });

    socket.on('admin_message', async ({ sessionId, content, attachments = [] }, acknowledge) => {
      try {
        const user = await authorizeAdmin(socket, 'chat.reply');
        if (!user) {
          acknowledge?.({ success: false, error: { code: 'MISSING_PERMISSION', permission: 'chat.reply' } });
          return socket.emit('permission_error', { permission: 'chat.reply' });
        }
        const session = await ChatSession.findById(sessionId);
        if (!session) return acknowledge?.({ success: false, error: { code: 'SESSION_NOT_FOUND' } });
        const message = new ChatMessage({ sessionId, sender: 'admin', content, attachments });
        await message.save();
        session.lastMessageAt = new Date();
        await session.save();
        chatNs.to(sessionId).emit('new_message', message);
        acknowledge?.({ success: true, data: message });
      } catch (err) {
        console.error('Lỗi khi gửi tin nhắn admin:', err);
        acknowledge?.({ success: false, error: { code: 'INTERNAL_ERROR' } });
      }
    });
  });
};
