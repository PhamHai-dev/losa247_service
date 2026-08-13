const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/settings.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');
const upload = require('../../config/multer');
const cache = require('../../services/cacheService');

router.use(authMiddleware('admin'));

router.get('/appearance', requirePermission('settings.view'), settingsController.getAppearance);
router.put('/appearance', requirePermission('settings.update'), cache.invalidateAfterSuccess(() => ({ keys: [cache.keys.appearance()] })), settingsController.updateAppearance);
router.get('/site-info', requirePermission('settings.view'), settingsController.getSiteInfo);
router.put('/site-info', requirePermission('settings.update'), cache.invalidateAfterSuccess(() => ({ keys: [cache.keys.siteInfo()] })), settingsController.updateSiteInfo);
router.post('/upload-asset', requirePermission('settings.update'), upload.single('file'), settingsController.uploadAsset);

module.exports = router;
