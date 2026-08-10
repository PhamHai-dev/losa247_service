const express = require('express');
const router = express.Router();
const pricingController = require('../../controllers/admin/pricing.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));

// Plans
router.get('/plans', requirePermission('pricing.view'), pricingController.getPlans);
router.get('/plans/:id', requirePermission('pricing.view'), pricingController.getPlanById);
router.post('/plans', requirePermission('pricing.create'), pricingController.createPlan);
router.put('/plans/:id', requirePermission('pricing.update'), pricingController.updatePlan);
router.delete('/plans/:id', requirePermission('pricing.delete'), pricingController.deletePlan);

// Comparisons
router.get('/comparisons', requirePermission('pricing.view'), pricingController.getComparisons);
router.get('/comparisons/:id', requirePermission('pricing.view'), pricingController.getComparisonById);
router.post('/comparisons', requirePermission('pricing.create'), pricingController.createComparison);
router.put('/comparisons/:id', requirePermission('pricing.update'), pricingController.updateComparison);
router.delete('/comparisons/:id', requirePermission('pricing.delete'), pricingController.deleteComparison);

module.exports = router;
