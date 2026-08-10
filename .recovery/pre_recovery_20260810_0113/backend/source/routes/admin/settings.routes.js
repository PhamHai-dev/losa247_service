const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/settings.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const upload = require('../../config/multer'); // Sử dụng cấu hình multer đã có

router.use(authMiddleware('admin'));

router.get('/appearance', settingsController.getAppearance);
router.put('/appearance', settingsController.updateAppearance);

router.get('/site-info', settingsController.getSiteInfo);
router.put('/site-info', settingsController.updateSiteInfo);

router.post('/upload-asset', upload.single('file'), settingsController.uploadAsset);

module.exports = router;
