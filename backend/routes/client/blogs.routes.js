const express = require('express');
const router = express.Router();
const blogsController = require('../../controllers/client/blogs.controller');

// Public route cho client
router.get('/categories', blogsController.getPublicCategories);
router.get('/tags', blogsController.getPublicTags);
router.get('/', blogsController.getPublishedBlogs);
router.get('/:slug/related', blogsController.getRelatedBlogs);
router.get('/:slug', blogsController.getBlogBySlug);
router.post('/:slug/view', blogsController.incrementView);

module.exports = router;
