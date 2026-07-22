const express = require('express');
const router = express.Router();
const logController = require('../../controllers/admin/log.controller');

router.get('/export', logController.exportLogs);
router.get('/', logController.getLogs);

module.exports = router;
