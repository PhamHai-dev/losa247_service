const express = require('express');
const router = express.Router();
const blogsController = require('../../controllers/admin/blogs.controller');
const blogTagsController = require('../../controllers/admin/blogTags.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');
const cache = require('../../services/cacheService');

const invalidateBlogs = cache.invalidateAfterSuccess(() => ({ patterns: [cache.patterns.allBlogs()] }));

router.use(authMiddleware('admin'));
router.get('/tags', requirePermission('blogs.view'), blogTagsController.getTags);
router.post('/tags', requirePermission('blogs.create'), invalidateBlogs, blogTagsController.createTag);
router.put('/tags/:id', requirePermission('blogs.update'), invalidateBlogs, blogTagsController.updateTag);
router.delete('/tags/:id', requirePermission('blogs.delete'), invalidateBlogs, blogTagsController.deleteTag);
router.get('/categories', requirePermission('blogs.view'), blogsController.getCategories);
router.post('/categories', requirePermission('blogs.create'), invalidateBlogs, blogsController.createCategory);
router.put('/categories/:id', requirePermission('blogs.update'), invalidateBlogs, blogsController.updateCategory);
router.delete('/categories/:id', requirePermission('blogs.delete'), invalidateBlogs, blogsController.deleteCategory);
router.get('/stats', requirePermission('blogs.view'), blogsController.getStats);
router.get('/', requirePermission('blogs.view'), blogsController.getBlogs);
router.post('/', requirePermission('blogs.create'), invalidateBlogs, blogsController.createBlog);
router.put('/:id', requirePermission('blogs.update'), invalidateBlogs, blogsController.updateBlog);
router.delete('/:id', requirePermission('blogs.delete'), invalidateBlogs, blogsController.deleteBlog);
router.patch('/:id/approve', requirePermission('blogs.publish'), invalidateBlogs, blogsController.approveBlog);
router.patch('/:id/reject', requirePermission('blogs.publish'), invalidateBlogs, blogsController.rejectBlog);
module.exports = router;
