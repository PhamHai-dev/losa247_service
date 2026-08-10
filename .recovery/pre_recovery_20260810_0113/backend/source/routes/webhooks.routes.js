const express = require('express');
const router = express.Router();
const chatController = require('../controllers/admin/chat.controller');

// Webhook từ n8n trả kết quả bot reply, không gắn authMiddleware
router.post('/n8n/chat-reply', chatController.n8nChatReplyWebhook);

module.exports = router;
