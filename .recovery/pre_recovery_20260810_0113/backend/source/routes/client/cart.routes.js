const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/client/cart.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('client'));

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.patch('/items/:id', cartController.updateCartItem);
router.delete('/items/:id', cartController.removeFromCart);

module.exports = router;
