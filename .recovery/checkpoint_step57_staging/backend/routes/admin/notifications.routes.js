const express = require('express');
const router = express.Router();
const notificationsController = require('../../controllers/admin/notifications.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));

router.get('/', requirePermission('notifications.view'), notificationsController.getNotifications);
router.put('/:id/read', requirePermission('notifications.update'), notificationsController.markAsRead);

module.exports = router;
