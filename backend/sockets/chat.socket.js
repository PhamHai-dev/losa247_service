const ChatSession = require('../models/ChatSession.model');
const ChatMessage = require('../models/ChatMessage.model');
const n8nHelper = require('../helpers/n8n');

module.exports = (io) => {
  const chatNs = io.of('/chat');

  chatNs.on('connection', (socket) => {
    socket.on('join_session', ({ sessionId }) => {
      socket.join(sessionId);
    });

    socket.on('customer_message', async ({ sessionId, content, attachments = [] }) => {
      try {
        const session = await ChatSession.findById(sessionId);
        if (!session) return;

        const message = new ChatMessage({
          sessionId,
          sender: 'customer',
          content,
          attachments,
        });
        await message.save();

        session.lastMessageAt = new Date();
        await session.save();

        chatNs.to(sessionId).emit('new_message', message);

        if (session.mode === 'bot') {
          await n8nHelper.forwardChatMessage(sessionId, message);
        }
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

    socket.on('admin_message', async ({ sessionId, content, attachments = [] }) => {
      try {
        const session = await ChatSession.findById(sessionId);
        if (!session) return;

        const message = new ChatMessage({
          sessionId,
          sender: 'admin',
          content,
          attachments,
        });
        await message.save();

        session.lastMessageAt = new Date();
        await session.save();

        chatNs.to(sessionId).emit('new_message', message);
      } catch (err) {
        console.error('Lỗi khi gửi tin nhắn admin:', err);
      }
    });
  });
};
