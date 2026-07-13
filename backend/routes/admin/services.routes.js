const express = require('express');
const router = express.Router();
const servicesController = require('../../controllers/admin/services.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('admin'));

router.get('/', servicesController.getServices);
router.post('/', servicesController.createService);
router.put('/:id', servicesController.updateService);
router.delete('/:id', servicesController.deleteService);

module.exports = router;
