const express = require('express');
const router = express.Router();
const blogsController = require('../../controllers/client/blogs.controller');
const cache = require('../../services/cacheService');

const blogListKey = (req) => cache.keys.blogList({ page: req.query.page || 1, limit: req.query.limit || 20, search: req.query.search, category: req.query.category, tag: req.query.tag, isFeatured: req.query.isFeatured, excludeId: req.query.excludeId, sort: req.query.sort });

// Public route cho client
router.get('/categories', cache.middleware(() => cache.keys.blogCategories(), cache.TTL.BLOG_TAXONOMY), blogsController.getPublicCategories);
router.get('/tags', cache.middleware((req) => cache.keys.blogTags({ limit: req.query.limit || 20 }), cache.TTL.BLOG_TAXONOMY), blogsController.getPublicTags);
router.get('/', cache.middleware(blogListKey, cache.TTL.BLOG_LIST), blogsController.getPublishedBlogs);
router.get('/:slug/related', cache.middleware((req) => cache.keys.blogRelated(req.params.slug), cache.TTL.BLOG_LIST), blogsController.getRelatedBlogs);
router.get('/:slug', cache.middleware((req) => cache.keys.blogSlug(req.params.slug), cache.TTL.BLOG_DETAIL), blogsController.getBlogBySlug);
router.post('/:slug/view', cache.invalidateAfterSuccess((req) => ({ patterns: [cache.patterns.blogLists()], keys: [cache.keys.blogSlug(req.params.slug)] })), blogsController.incrementView);

module.exports = router;
