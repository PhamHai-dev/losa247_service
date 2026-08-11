const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/settings.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');
const upload = require('../../config/multer');

router.use(authMiddleware('admin'));

router.get('/appearance', requirePermission('settings.view'), settingsController.getAppearance);
router.put('/appearance', requirePermission('settings.update'), settingsController.updateAppearance);
router.get('/site-info', requirePermission('settings.view'), settingsController.getSiteInfo);
router.put('/site-info', requirePermission('settings.update'), settingsController.updateSiteInfo);
router.post('/upload-asset', requirePermission('settings.update'), upload.single('file'), settingsController.uploadAsset);

module.exports = router;
