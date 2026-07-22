const Blog = require('../../models/Blog.model');
const BlogCategory = require('../../models/BlogCategory.model');
const BlogTag = require('../../models/BlogTag.model');
const { paginate, buildPaginationResponse } = require('../../helpers/format');

exports.getPublishedBlogs = async (req, res, next) => {
  try {
    const { page, limit, search, category, tag, isFeatured, excludeId } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (isFeatured === 'true') filter.isFeatured = true;
    if (excludeId) filter._id = { $ne: excludeId };
    
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    let sortOption = { publishedAt: -1 };
    if (req.query.sort === 'oldest') sortOption = { publishedAt: 1 };
    if (req.query.sort === 'popular') sortOption = { views: -1 };

    const [data, total] = await Promise.all([
      Blog.find(filter)
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .populate('author', 'name avatarUrl')
        .sort(sortOption)
        .skip(skip)
        .limit(l),
      Blog.countDocuments(filter),
    ]);

    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) {
    next(err);
  }
};

exports.getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('author', 'name avatarUrl');

    if (!blog) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    }

    res.json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};

exports.incrementView = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } }
    );
    
    if (!blog) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    }

    res.json({ success: true, message: 'Đã tăng lượt xem' });
  } catch (err) {
    next(err);
  }
};

exports.getPublicCategories = async (req, res, next) => {
  try {
    const categories = await BlogCategory.aggregate([
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'category',
          pipeline: [{ $match: { status: 'published' } }],
          as: 'blogs'
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          count: { $size: '$blogs' }
        }
      },
      { $sort: { count: -1, name: 1 } }
    ]);
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

exports.getPublicTags = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const tags = await BlogTag.aggregate([
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'tags',
          pipeline: [{ $match: { status: 'published' } }],
          as: 'blogs'
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          count: { $size: '$blogs' }
        }
      },
      { $sort: { count: -1, name: 1 } },
      { $limit: limit }
    ]);
    res.json({ success: true, data: tags });
  } catch (err) {
    next(err);
  }
};

exports.getRelatedBlogs = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) return res.json({ success: true, data: [] });

    let related = [];
    const limit = 3;

    // 1. Same tags
    if (blog.tags && blog.tags.length > 0) {
      const byTags = await Blog.find({ 
        _id: { $ne: blog._id }, 
        status: 'published',
        tags: { $in: blog.tags } 
      }).limit(limit).sort({ publishedAt: -1 }).populate('category', 'name slug').populate('author', 'name avatarUrl');
      related.push(...byTags);
    }

    // 2. Same category
    if (related.length < limit && blog.category) {
      const byCategory = await Blog.find({
        _id: { $nin: [blog._id, ...related.map(b => b._id)] },
        status: 'published',
        category: blog.category
      }).limit(limit - related.length).sort({ publishedAt: -1 }).populate('category', 'name slug').populate('author', 'name avatarUrl');
      related.push(...byCategory);
    }

    // 3. Newest
    if (related.length < limit) {
      const byNewest = await Blog.find({
        _id: { $nin: [blog._id, ...related.map(b => b._id)] },
        status: 'published'
      }).limit(limit - related.length).sort({ publishedAt: -1 }).populate('category', 'name slug').populate('author', 'name avatarUrl');
      related.push(...byNewest);
    }

    res.json({ success: true, data: related });
  } catch (err) {
    next(err);
  }
};
