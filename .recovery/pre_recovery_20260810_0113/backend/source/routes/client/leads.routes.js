const express = require('express');
const router = express.Router();
const leadsController = require('../../controllers/client/leads.controller');

router.post('/', leadsController.createLead);

module.exports = router;
