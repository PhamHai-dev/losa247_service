const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/admin/orders.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));
// router.use(rbacMiddleware(['manage_orders']));

router.get('/abandoned', ordersController.getAbandonedCarts);
router.post('/:id/remind', ordersController.remindAbandonedCart);

module.exports = router;
