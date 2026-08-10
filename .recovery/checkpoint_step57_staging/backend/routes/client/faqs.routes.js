const express = require('express');
const router = express.Router();
const faqsController = require('../../controllers/client/faqs.controller');

router.get('/', faqsController.getFaqs);

module.exports = router;
