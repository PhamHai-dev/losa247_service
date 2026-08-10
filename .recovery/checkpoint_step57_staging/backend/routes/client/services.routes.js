const express = require('express');
const router = express.Router();
const servicesController = require('../../controllers/client/services.controller');

router.get('/', servicesController.getServices);
router.get('/:slug', servicesController.getServiceBySlug);

module.exports = router;
