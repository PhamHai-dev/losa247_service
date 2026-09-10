const express = require('express');
const router = express.Router();
const uploadsController = require('../../controllers/admin/uploads.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');
const upload = require('../../config/multer');

router.use(authMiddleware('admin'));
router.post('/blog-image', requirePermission('blogs.update'), upload.single('file'), uploadsController.uploadBlogImage);
router.post('/logo-image', requirePermission('settings.update'), upload.single('file'), uploadsController.uploadLogoImage);
router.post('/favicon-image', requirePermission('settings.update'), upload.single('file'), uploadsController.uploadFaviconImage);

module.exports = router;
