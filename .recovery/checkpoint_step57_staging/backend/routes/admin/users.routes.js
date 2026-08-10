const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/admin/users.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission, requireAnyPermission } = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));
router.get('/', requirePermission('users.view'), usersController.getUsers);
router.post('/', requirePermission('users.create'), usersController.createUser);
router.patch('/:id', requireAnyPermission(['users.update', 'users.lock']), usersController.updateUser);

module.exports = router;
