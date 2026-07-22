const express = require('express');
const router = express.Router();
const authController = require('../../controllers/client/auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware('client'), authController.getMe);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
