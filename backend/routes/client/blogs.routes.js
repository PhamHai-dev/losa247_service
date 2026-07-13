const express = require('express');
const router = express.Router();
const blogsController = require('../../controllers/client/blogs.controller');

// Public route cho client
router.get('/', blogsController.getPublishedBlogs);
router.get('/:slug', blogsController.getBlogBySlug);

module.exports = router;
