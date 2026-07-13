const Blog = require('../../models/Blog.model');
const { paginate, buildPaginationResponse } = require('../../helpers/format');

exports.getPublishedBlogs = async (req, res, next) => {
  try {
    const { page, limit, search, category } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      Blog.find(filter)
        .populate('category', 'name slug')
        .populate('author', 'name avatarUrl')
        .sort({ publishedAt: -1 })
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
      .populate('author', 'name avatarUrl');

    if (!blog) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    }

    res.json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};
