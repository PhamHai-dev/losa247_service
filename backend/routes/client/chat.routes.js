const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/client/chat.controller');
const upload = require('../../config/multer');

router.post('/session', chatController.startSession);
router.get('/:sessionId/messages', chatController.getSessionMessages);
router.post('/sessions/:sessionId/messages', chatController.sendMessage);
router.post('/sessions/:sessionId/request-human', chatController.requestHuman);
router.get('/sessions/:sessionId/events', chatController.streamEvents);
router.post('/upload-attachment', upload.single('file'), chatController.uploadAttachment);

module.exports = router;
