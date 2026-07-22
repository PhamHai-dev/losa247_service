const Blog = require('../../models/Blog.model');
const BlogCategory = require('../../models/BlogCategory.model');
const { paginate, buildPaginationResponse, generateSlug } = require('../../helpers/format');
const { createBlogSchema, createBlogCategorySchema } = require('../../validators/admin/blogs.validator');

// --- BLOG CATEGORY ---
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await BlogCategory.aggregate([
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'category',
          as: 'blogsList'
        }
      },
      {
        $addFields: {
          blogCount: { $size: '$blogsList' }
        }
      },
      {
        $project: {
          blogsList: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = createBlogCategorySchema.parse(req.body);
    const slug = generateSlug(name);
    
    let category = await BlogCategory.findOne({ slug });
    if (category) {
      return res.status(400).json({ success: false, error: { code: 'EXISTS', message: 'Danh mục này đã tồn tại' } });
    }

    category = new BlogCategory({ name, slug });
    await category.save();

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = createBlogCategorySchema.parse(req.body);
    const slug = generateSlug(name);

    const category = await BlogCategory.findByIdAndUpdate(req.params.id, { name, slug }, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy danh mục' } });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await BlogCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá danh mục' });
  } catch (err) {
    next(err);
  }
};

// --- BLOG ---
exports.getStats = async (req, res, next) => {
  try {
    const stats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          publishedBlogs: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          pendingBlogs: { $sum: { $cond: [{ $in: ['$status', ['pending_review', 'draft']] }, 1, 0] } },
          totalViews: { $sum: { $ifNull: ['$views', 0] } },
        }
      }
    ]);

    const result = stats[0] || {
      totalBlogs: 0,
      publishedBlogs: 0,
      pendingBlogs: 0,
      totalViews: 0,
    };

    delete result._id;
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getBlogs = async (req, res, next) => {
  try {
    const { page, limit, search, status, source, category } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (category) filter.category = category;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      Blog.find(filter)
        .populate('category', 'name')
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l),
      Blog.countDocuments(filter),
    ]);

    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) {
    next(err);
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    const data = createBlogSchema.parse(req.body);
    const slug = data.slug || generateSlug(data.title);

    const blog = new Blog({
      ...data,
      slug,
      source: 'manual',
      author: req.user._id,
      publishedAt: data.status === 'published' ? new Date() : null,
    });

    await blog.save();
    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    next(err);
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const data = createBlogSchema.parse(req.body);
    const slug = data.slug || generateSlug(data.title);

    const updateData = { ...data, slug };
    if (data.status === 'published') {
      updateData.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!blog) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    }

    res.json({ success: true, data: blog });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    next(err);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá bài viết' });
  } catch (err) {
    next(err);
  }
};

exports.approveBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });

    blog.status = 'published';
    blog.publishedAt = new Date();
    await blog.save();

    res.json({ success: true, message: 'Đã duyệt bài viết' });
  } catch (err) {
    next(err);
  }
};

exports.rejectBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });

    blog.status = 'draft';
    await blog.save();

    res.json({ success: true, message: 'Đã từ chối và chuyển về nháp' });
  } catch (err) {
    next(err);
  }
};

// Webhook từ n8n
exports.facebookCrawlWebhook = async (req, res, next) => {
  try {
    // n8n gửi payload chứa bài viết crawl
    const { title, content, coverImageUrl } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Missing title or content' });
    }

    const slug = generateSlug(title) + '-' + Date.now();

    const blog = new Blog({
      title,
      slug,
      content,
      coverImageUrl,
      status: 'pending_review',
      source: 'facebook_crawl',
    });

    await blog.save();

    res.json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};
