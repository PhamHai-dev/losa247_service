const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/client/orders.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('client'));

router.post('/', ordersController.createOrder);
router.get('/:id', ordersController.getOrderById);

module.exports = router;
