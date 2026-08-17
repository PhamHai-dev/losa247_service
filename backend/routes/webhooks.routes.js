const express = require('express');
const router = express.Router();
const chatController = require('../controllers/admin/chat.controller');
const verifyWebhookSignature = require('../middlewares/webhookSignature.middleware');
const { webhookLimiter } = require('../middlewares/rateLimit.middleware');

// Webhook n8n bắt buộc có timestamp và chữ ký HMAC-SHA256.
router.post('/n8n/chat-reply', webhookLimiter, verifyWebhookSignature, chatController.n8nChatReplyWebhook);

module.exports = router;
