const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/login', authController.login);
router.get('/me', authMiddleware('admin'), authController.getMe);
// Có thể thêm /refresh, /logout sau

module.exports = router;
