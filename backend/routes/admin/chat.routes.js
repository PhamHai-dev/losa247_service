const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/admin/chat.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('admin'));

router.get('/sessions', chatController.getSessions);
router.get('/sessions/:id/messages', chatController.getSessionMessages);
router.post('/sessions/:id/takeover', chatController.takeoverSession);
router.post('/sessions/:id/release', chatController.releaseSession);
router.patch('/messages/:id/feedback', chatController.updateMessageFeedback);

module.exports = router;
