const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { loginLimiter, refreshLimiter } = require('../../middlewares/rateLimit.middleware');

router.post('/login', loginLimiter, authController.login);
router.get('/me', authMiddleware('admin'), authController.getMe);
router.post('/refresh', refreshLimiter, authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
