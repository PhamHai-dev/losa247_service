const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboard.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));
router.use(requirePermission('dashboard.view'));

router.get('/kpis', dashboardController.getKpis);
router.get('/leads-chart', dashboardController.getLeadsChart);
router.get('/lead-status', dashboardController.getLeadStatus);
router.get('/recent-leads', dashboardController.getRecentLeads);
router.get('/popular-content', dashboardController.getPopularContent);

module.exports = router;
