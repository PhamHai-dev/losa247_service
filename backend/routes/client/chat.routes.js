const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/client/chat.controller');

router.post('/session', chatController.startSession);
router.get('/:sessionId/messages', chatController.getSessionMessages);

module.exports = router;
