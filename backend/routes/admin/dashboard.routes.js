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
router.get('/revenue-chart', dashboardController.getRevenueChart);
router.get('/lead-sources', dashboardController.getLeadSources);

module.exports = router;
