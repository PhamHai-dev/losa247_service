const express = require('express');
const router = express.Router();
const apiConfigsController = require('../../controllers/admin/apiConfigs.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));

router.get('/', requirePermission('apiConfigs.view'), apiConfigsController.getApiConfigs);
router.put('/:provider', requirePermission('apiConfigs.update'), apiConfigsController.updateApiConfig);
router.post('/:provider/test', requirePermission('apiConfigs.update'), apiConfigsController.testApiConfig);

module.exports = router;
