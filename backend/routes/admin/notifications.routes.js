const express = require('express');
const router = express.Router();
const notificationsController = require('../../controllers/admin/notifications.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');
// Native EventSource xác thực bằng stream ticket vì không gửi được Authorization header.
router.get('/events', notificationsController.streamEvents);
router.use(authMiddleware('admin'));
router.get('/', requirePermission('notifications.view'), notificationsController.getNotifications);
router.post('/stream-ticket', requirePermission('notifications.view'), notificationsController.createStreamTicket);
router.put('/:id/read', requirePermission('notifications.update'), notificationsController.markAsRead);
module.exports = router;
