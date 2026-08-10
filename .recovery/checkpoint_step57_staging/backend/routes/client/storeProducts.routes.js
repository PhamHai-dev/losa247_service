const express = require('express');
const router = express.Router();
const storeProductsController = require('../../controllers/client/storeProducts.controller');

router.get('/', storeProductsController.getStoreProducts);
router.get('/:id', storeProductsController.getStoreProductById);

module.exports = router;
