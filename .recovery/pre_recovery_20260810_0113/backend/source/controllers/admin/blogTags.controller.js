const BlogTag = require('../../models/BlogTag.model');
const Blog = require('../../models/Blog.model');
const { createBlogTagSchema } = require('../../validators/admin/blogs.validator');
const { z } = require('zod');
const slugify = require('slugify');

exports.getTags = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const tags = await BlogTag.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BlogTag.countDocuments(query);

    // Aggregate post count for each tag
    const tagIds = tags.map((t) => t._id);
    const blogCounts = await Blog.aggregate([
      { $match: { tags: { $in: tagIds } } },
      { $unwind: '$tags' },
      { $match: { tags: { $in: tagIds } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    blogCounts.forEach((bc) => {
      countMap[bc._id.toString()] = bc.count;
    });

    const items = tags.map((t) => ({
      ...t.toObject(),
      postCount: countMap[t._id.toString()] || 0,
    }));

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thẻ', error: error.message });
  }
};

exports.createTag = async (req, res) => {
  try {
    const data = createBlogTagSchema.parse(req.body);

    const slug = data.slug || slugify(data.name, { lower: true, locale: 'vi' });
    const existing = await BlogTag.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Slug thẻ đã tồn tại' });
    }

    const tag = new BlogTag({ ...data, slug });
    await tag.save();

    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Lỗi khi tạo thẻ', error: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const data = createBlogTagSchema.parse(req.body);

    const slug = data.slug || slugify(data.name, { lower: true, locale: 'vi' });
    const existing = await BlogTag.findOne({ slug, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug thẻ đã tồn tại' });
    }

    const tag = await BlogTag.findByIdAndUpdate(
      req.params.id,
      { ...data, slug },
      { new: true, runValidators: true }
    );
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ' });
    }

    res.json({ success: true, data: tag });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật thẻ', error: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const tag = await BlogTag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ' });
    }

    // Check if tag is used in blogs
    const usedInBlogs = await Blog.exists({ tags: req.params.id });
    if (usedInBlogs) {
      return res.status(400).json({ success: false, message: 'Không thể xoá thẻ đang được sử dụng trong bài viết' });
    }

    await BlogTag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Xóa thẻ thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa thẻ', error: error.message });
  }
};
