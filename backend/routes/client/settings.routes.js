const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/settings.controller');
const cache = require('../../services/cacheService');

router.get('/site-info', cache.middleware(() => cache.keys.siteInfo(), cache.TTL.SETTINGS), settingsController.getSiteInfo);
router.get('/appearance', cache.middleware(() => cache.keys.appearance(), cache.TTL.SETTINGS), settingsController.getAppearance);
router.get('/lead-form', cache.middleware(() => cache.keys.leadForm(), cache.TTL.SETTINGS), settingsController.getLeadForm);

module.exports = router;
