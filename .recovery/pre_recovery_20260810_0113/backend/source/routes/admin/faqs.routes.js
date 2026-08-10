const express = require('express');
const router = express.Router();
const faqsController = require('../../controllers/admin/faqs.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware('admin'));

router.get('/', faqsController.getFaqs);
router.post('/', faqsController.createFaq);
router.patch('/reorder', faqsController.reorderFaqs);
router.get('/search-suggestions', faqsController.searchSuggestions);
router.put('/:id', faqsController.updateFaq);
router.delete('/:id', faqsController.deleteFaq);

module.exports = router;
