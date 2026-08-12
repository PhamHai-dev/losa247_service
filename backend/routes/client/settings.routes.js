const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/settings.controller');

router.get('/site-info', settingsController.getSiteInfo);
router.get('/appearance', settingsController.getAppearance);

module.exports = router;
