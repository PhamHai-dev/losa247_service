const express = require('express');
const router = express.Router();
const pricingController = require('../../controllers/admin/pricing.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('admin'));

// Plans
router.get('/plans', pricingController.getPlans);
router.get('/plans/:id', pricingController.getPlanById);
router.post('/plans', pricingController.createPlan);
router.put('/plans/:id', pricingController.updatePlan);
router.delete('/plans/:id', pricingController.deletePlan);

// Comparisons
router.get('/comparisons', pricingController.getComparisons);
router.get('/comparisons/:id', pricingController.getComparisonById);
router.post('/comparisons', pricingController.createComparison);
router.put('/comparisons/:id', pricingController.updateComparison);
router.delete('/comparisons/:id', pricingController.deleteComparison);

module.exports = router;
