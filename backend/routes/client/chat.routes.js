const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/client/chat.controller');
const upload = require('../../config/multer');

router.post('/session', chatController.startSession);
router.get('/:sessionId/messages', chatController.getSessionMessages);
router.post('/upload-attachment', upload.single('file'), chatController.uploadAttachment);

module.exports = router;
