const express = require('express');
const router = express.Router();
const apiConfigsController = require('../../controllers/admin/apiConfigs.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('admin'));

router.get('/', apiConfigsController.getApiConfigs);
router.put('/:provider', apiConfigsController.updateApiConfig);
router.post('/:provider/test', apiConfigsController.testApiConfig);

module.exports = router;
