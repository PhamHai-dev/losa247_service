const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/login', authController.login);
router.get('/me', authMiddleware('admin'), authController.getMe);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
