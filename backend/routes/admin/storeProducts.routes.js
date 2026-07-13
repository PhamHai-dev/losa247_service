const express = require('express');
const router = express.Router();
const storeProductsController = require('../../controllers/admin/storeProducts.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('admin'));

router.get('/', storeProductsController.getStoreProducts);
router.post('/', storeProductsController.createStoreProduct);
router.put('/:id', storeProductsController.updateStoreProduct);
router.delete('/:id', storeProductsController.deleteStoreProduct);

module.exports = router;
