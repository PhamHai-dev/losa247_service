const express = require('express');
const router = express.Router();
const logController = require('../../controllers/admin/log.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));
router.use(requirePermission('logs.view'));

router.get('/export', logController.exportLogs);
router.get('/', logController.getLogs);

module.exports = router;
