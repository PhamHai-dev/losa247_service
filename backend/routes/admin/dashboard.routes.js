const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboard.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');

// Áp dụng middleware auth cho tất cả route admin
router.use(authMiddleware('admin'));
// Chỉ admin hoặc người có quyền mới xem được dashboard (nếu không truyền mảng rbac thì tạm thời ai qua authMiddleware('admin') cũng xem được, hoặc tuỳ cấu hình của bạn)
// router.use(rbacMiddleware(['view_dashboard'])); 

router.get('/kpis', dashboardController.getKpis);
router.get('/leads-chart', dashboardController.getLeadsChart);
router.get('/lead-status', dashboardController.getLeadStatus);
router.get('/recent-leads', dashboardController.getRecentLeads);
router.get('/popular-content', dashboardController.getPopularContent);

module.exports = router;
