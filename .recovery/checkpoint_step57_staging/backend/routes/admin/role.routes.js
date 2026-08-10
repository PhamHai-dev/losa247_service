const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/admin/role.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));

router.get('/permissions', requirePermission('roles.view'), roleController.getPermissionCatalog);
router.put('/permissions/bulk', requirePermission('roles.update'), roleController.bulkUpdatePermissions);
router.get('/', requirePermission('roles.view'), roleController.getRoles);
router.post('/', requirePermission('roles.create'), roleController.createRole);
router.put('/:id', requirePermission('roles.update'), roleController.updateRole);
router.delete('/:id', requirePermission('roles.delete'), roleController.deleteRole);

module.exports = router;
