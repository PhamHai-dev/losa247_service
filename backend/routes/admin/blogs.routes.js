const express = require('express');
const router = express.Router();
const blogsController = require('../../controllers/admin/blogs.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');

// Public webhook
router.post('/webhook/facebook-crawl', blogsController.facebookCrawlWebhook);

router.use(authMiddleware('admin'));
// router.use(rbacMiddleware(['manage_blogs']));

// Category routes (đặt trước để không bị bắt bởi /:id)
router.get('/categories', blogsController.getCategories);
router.post('/categories', blogsController.createCategory);
router.put('/categories/:id', blogsController.updateCategory);
router.delete('/categories/:id', blogsController.deleteCategory);

router.get('/', blogsController.getBlogs);
router.post('/', blogsController.createBlog);
router.put('/:id', blogsController.updateBlog);
router.delete('/:id', blogsController.deleteBlog);
router.patch('/:id/approve', blogsController.approveBlog);
router.patch('/:id/reject', blogsController.rejectBlog);

module.exports = router;
