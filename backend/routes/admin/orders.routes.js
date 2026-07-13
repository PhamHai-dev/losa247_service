const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/admin/orders.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));
// router.use(rbacMiddleware(['manage_orders']));

router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrderById);
router.patch('/:id/status', ordersController.updateStatus);
router.post('/:id/confirm-payment', ordersController.confirmPayment);
router.post('/:id/activate', ordersController.activateOrder);
router.post('/:id/cancel', ordersController.cancelOrder);

module.exports = router;
