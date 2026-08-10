const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/admin/chat.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));

router.get('/sessions', requirePermission('chat.view'), chatController.getSessions);
router.get('/sessions/:id/messages', requirePermission('chat.view'), chatController.getSessionMessages);
router.post('/sessions/:id/takeover', requirePermission('chat.assign'), chatController.takeoverSession);
router.post('/sessions/:id/release', requirePermission('chat.assign'), chatController.releaseSession);
router.patch('/messages/:id/feedback', requirePermission('chat.reply'), chatController.updateMessageFeedback);

module.exports = router;
