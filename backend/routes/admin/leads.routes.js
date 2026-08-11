const express = require('express');
const router = express.Router();
const leadsController = require('../../controllers/admin/leads.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission, requireAnyPermission } = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));

router.get('/export', requirePermission('leads.export'), leadsController.exportLeads);
router.get('/stats', requirePermission('leads.view'), leadsController.getLeadStats);
router.patch('/bulk/update', requireAnyPermission(['leads.update', 'leads.assign']), leadsController.bulkUpdateLeads);
router.post('/bulk/delete', requirePermission('leads.delete'), leadsController.bulkDeleteLeads);
router.post('/bulk/email', requirePermission('leads.update'), leadsController.sendBulkEmail);
router.get('/', requirePermission('leads.view'), leadsController.getLeads);
router.post('/', requirePermission('leads.create'), leadsController.createLead);
router.get('/:id', requirePermission('leads.view'), leadsController.getLeadById);
router.patch('/:id', requireAnyPermission(['leads.update', 'leads.assign']), leadsController.updateLead);
router.delete('/:id', requirePermission('leads.delete'), leadsController.deleteLead);
router.post('/:id/notes', requirePermission('leads.update'), leadsController.addNote);
router.post('/:id/convert-to-order', requirePermission('leads.update'), leadsController.convertToOrder);

module.exports = router;
