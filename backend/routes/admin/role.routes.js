const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/admin/role.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('admin'));

router.get('/', roleController.getRoles);
router.post('/', roleController.createRole);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

module.exports = router;
