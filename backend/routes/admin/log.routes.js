const express = require('express');
const router = express.Router();
const logController = require('../../controllers/admin/log.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));
router.get('/export', requirePermission('logs.view'), logController.exportLogs);
router.get('/', requirePermission('logs.view'), logController.getLogs);

module.exports = router;
