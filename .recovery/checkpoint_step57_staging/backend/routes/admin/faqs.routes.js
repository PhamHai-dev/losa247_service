const express = require('express');
const router = express.Router();
const faqsController = require('../../controllers/admin/faqs.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');

router.use(authMiddleware('admin'));

router.get('/', requirePermission('faqs.view'), faqsController.getFaqs);
router.post('/', requirePermission('faqs.create'), faqsController.createFaq);
router.patch('/reorder', requirePermission('faqs.update'), faqsController.reorderFaqs);
router.get('/search-suggestions', requirePermission('faqs.view'), faqsController.searchSuggestions);
router.put('/:id', requirePermission('faqs.update'), faqsController.updateFaq);
router.delete('/:id', requirePermission('faqs.delete'), faqsController.deleteFaq);

module.exports = router;
