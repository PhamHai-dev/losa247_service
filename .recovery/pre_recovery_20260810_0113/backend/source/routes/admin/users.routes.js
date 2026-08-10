const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/admin/users.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('admin'));
// Chỉ định phân quyền tại controller hoặc bằng middleware rbac riêng nếu cần

router.get('/', usersController.getUsers);
router.post('/', usersController.createUser);
router.patch('/:id', usersController.updateUser);

module.exports = router;
