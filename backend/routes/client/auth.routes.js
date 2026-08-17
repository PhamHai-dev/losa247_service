const express = require('express');
const router = express.Router();
const authController = require('../../controllers/client/auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { loginLimiter, refreshLimiter, resetLimiter } = require('../../middlewares/rateLimit.middleware');

router.post('/register', loginLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/me', authMiddleware('client'), authController.getMe);
router.post('/refresh', refreshLimiter, authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', resetLimiter, authController.forgotPassword);
router.post('/reset-password', resetLimiter, authController.resetPassword);

module.exports = router;
