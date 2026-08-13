const express = require('express');
const router = express.Router();
const pricingController = require('../../controllers/admin/pricing.controller');
const cache = require('../../services/cacheService');

// Public route to get active plans
router.get('/plans', (req, res, next) => {
  // force isActive = true for public endpoint
  req.query.isActive = 'true';
  next();
}, cache.middleware((req) => cache.keys.pricingPlans({ page: req.query.page || 1, limit: req.query.limit || 20, search: req.query.search, isActive: true }), cache.TTL.PRICING), pricingController.getPlans);

// Public route to get comparisons
router.get('/comparisons', cache.middleware(() => cache.keys.pricingComparisons(), cache.TTL.PRICING), pricingController.getComparisons);

module.exports = router;
