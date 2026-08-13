const express = require('express');
const router = express.Router();
const faqsController = require('../../controllers/client/faqs.controller');
const cache = require('../../services/cacheService');

const faqKey = (req) => cache.keys.faqList({ page: req.query.page || 1, limit: req.query.limit || 20, search: req.query.search, category: req.query.category, serviceDetail: req.query.serviceDetail, pageType: req.query.pageType });
router.get('/', cache.middleware(faqKey, cache.TTL.FAQ), faqsController.getFaqs);

module.exports = router;
