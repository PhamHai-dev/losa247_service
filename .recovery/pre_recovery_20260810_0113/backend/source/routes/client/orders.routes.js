const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/client/orders.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('client'));

router.post('/', ordersController.createOrder);
router.get('/', ordersController.getMyOrders);
router.get('/:id', ordersController.getOrderById);
router.post('/:id/payment-callback', ordersController.paymentCallback);

module.exports = router;
