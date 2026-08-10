const express = require('express');
const router = express.Router();
const notificationsController = require('../../controllers/admin/notifications.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('admin'));

router.get('/', notificationsController.getNotifications);
router.put('/:id/read', notificationsController.markAsRead);

module.exports = router;
