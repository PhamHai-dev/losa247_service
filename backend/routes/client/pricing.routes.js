const express = require('express');
const router = express.Router();
const pricingController = require('../../controllers/admin/pricing.controller');

// Public route to get active plans
router.get('/plans', (req, res, next) => {
  // force isActive = true for public endpoint
  req.query.isActive = 'true';
  next();
}, pricingController.getPlans);

// Public route to get comparisons
router.get('/comparisons', pricingController.getComparisons);

module.exports = router;
