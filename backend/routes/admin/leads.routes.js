const express = require('express');
const router = express.Router();
const leadsController = require('../../controllers/admin/leads.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');

// Áp dụng middleware
router.use(authMiddleware('admin'));
// router.use(rbacMiddleware(['manage_leads'])); // Tuỳ chỉnh theo ma trận phân quyền thực tế

router.get('/', leadsController.getLeads);
router.get('/export', leadsController.exportLeads);
router.get('/:id', leadsController.getLeadById);
router.patch('/:id', leadsController.updateLead);
router.post('/:id/notes', leadsController.addNote);
router.post('/:id/convert-to-order', leadsController.convertToOrder);

module.exports = router;
