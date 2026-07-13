const express = require('express');
const router = express.Router();
const authController = require('../../controllers/client/auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware('client'), authController.getMe);
// Có thể thêm /refresh, /logout sau

module.exports = router;
