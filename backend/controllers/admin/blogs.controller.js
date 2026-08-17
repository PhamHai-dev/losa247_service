const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { toLegacyEntity, toLegacyUser } = require('../../repositories/core/legacyMapper');
const { paginate, buildPaginationResponse, generateSlug } = require('../../helpers/format');
const {
  createBlogSchema,
  createBlogCategorySchema,
} = require('../../validators/admin/blogs.validator');

const include = {
  category: true,
  author: { select: { id: true, name: true } },
  tags: { include: { tag: true } },
};
const mapBlog = ({ category, author, tags, ...blog }) => ({
  ...toLegacyEntity(blog),
  category: category ? toLegacyEntity(category) : null,
  author: author ? toLegacyUser(author) : null,
  tags: (tags || []).map(({ tag }) => toLegacyEntity(tag)),
});
const normalize = (input) => {
  const data = { ...input };
  const tagIds = data.tags || [];
  delete data.tags;
  if (data.category !== undefined) {
    data.categoryId = data.category || null;
    delete data.category;
  }
  if (data.coverImage !== undefined) {
    data.coverImageUrl = data.coverImage || null;
    delete data.coverImage;
  }
  return { data, tagIds };
};
const validationError = (res, err) =>
  res
    .status(400)
    .json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });

exports.getCategories = async (_req, res, next) => {
  try {
    const rows = await prisma.blogCategory.findMany({
      include: { _count: { select: { blogs: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({
      success: true,
      data: rows.map(({ _count, ...row }) => ({ ...toLegacyEntity(row), blogCount: _count.blogs })),
    });
  } catch (err) {
    return next(err);
  }
};
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = createBlogCategorySchema.parse(req.body);
    const slug = generateSlug(name);
    if (await prisma.blogCategory.findUnique({ where: { slug }, select: { id: true } }))
      return res
        .status(400)
        .json({ success: false, error: { code: 'EXISTS', message: 'Danh mục này đã tồn tại' } });
    const category = await prisma.blogCategory.create({
      data: { id: createEntityId(), name, slug },
    });
    return res.status(201).json({ success: true, data: toLegacyEntity(category) });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    return next(err);
  }
};
exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = createBlogCategorySchema.parse(req.body);
    if (
      !(await prisma.blogCategory.findUnique({
        where: { id: req.params.id },
        select: { id: true },
      }))
    )
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy danh mục' } });
    const category = await prisma.blogCategory.update({
      where: { id: req.params.id },
      data: { name, slug: generateSlug(name) },
    });
    return res.json({ success: true, data: toLegacyEntity(category) });
  } catch (err) {
    return next(err);
  }
};
exports.deleteCategory = async (req, res, next) => {
  try {
    await prisma.blogCategory.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Đã xoá danh mục' });
  } catch (err) {
    return next(err);
  }
};
exports.getStats = async (_req, res, next) => {
  try {
    const [totalBlogs, publishedBlogs, pendingBlogs, views] = await Promise.all([
      prisma.blog.count(),
      prisma.blog.count({ where: { status: 'published' } }),
      prisma.blog.count({ where: { status: { in: ['pending', 'draft'] } } }),
      prisma.blog.aggregate({ _sum: { views: true } }),
    ]);
    return res.json({
      success: true,
      data: { totalBlogs, publishedBlogs, pendingBlogs, totalViews: views._sum.views || 0 },
    });
  } catch (err) {
    return next(err);
  }
};
exports.getBlogs = async (req, res, next) => {
  try {
    const { skip, limit, page } = paginate(req.query, req.query);
    const { search, status, source, category } = req.query;
    const where = {
      ...(status ? { status } : {}),
      ...(source === 'writer'
        ? { source: { in: ['writer', 'manual'] } }
        : source === 'other'
          ? { source: { in: ['other', 'facebook_crawl'] } }
          : {}),
      ...(category ? { categoryId: category } : {}),
      ...(search ? { title: { contains: search } } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.blog.findMany({ where, include, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.blog.count({ where }),
    ]);
    return res.json(buildPaginationResponse(rows.map(mapBlog), total, page, limit));
  } catch (err) {
    return next(err);
  }
};
exports.createBlog = async (req, res, next) => {
  try {
    const parsed = createBlogSchema.parse(req.body);
    const { data, tagIds } = normalize(parsed);
    const blog = await prisma.blog.create({
      data: {
        id: createEntityId(),
        ...data,
        slug: data.slug || generateSlug(data.title),
        authorId: req.user._id,
        publishedAt: data.status === 'published' ? new Date() : null,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
      include,
    });
    return res.status(201).json({ success: true, data: mapBlog(blog) });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    return next(err);
  }
};
exports.updateBlog = async (req, res, next) => {
  try {
    const parsed = createBlogSchema.parse(req.body);
    const { data, tagIds } = normalize(parsed);
    if (!(await prisma.blog.findUnique({ where: { id: req.params.id }, select: { id: true } })))
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    const blog = await prisma.blog.update({
      where: { id: req.params.id },
      data: {
        ...data,
        slug: data.slug || generateSlug(data.title),
        ...(data.status === 'published' ? { publishedAt: new Date() } : {}),
        tags: { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) },
      },
      include,
    });
    return res.json({ success: true, data: mapBlog(blog) });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    return next(err);
  }
};
exports.deleteBlog = async (req, res, next) => {
  try {
    await prisma.blog.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Đã xoá bài viết' });
  } catch (err) {
    return next(err);
  }
};
exports.approveBlog = async (req, res, next) => {
  try {
    if (!(await prisma.blog.findUnique({ where: { id: req.params.id }, select: { id: true } })))
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    await prisma.blog.update({
      where: { id: req.params.id },
      data: { status: 'published', publishedAt: new Date() },
    });
    return res.json({ success: true, message: 'Đã duyệt bài viết' });
  } catch (err) {
    return next(err);
  }
};
exports.rejectBlog = async (req, res, next) => {
  try {
    if (!(await prisma.blog.findUnique({ where: { id: req.params.id }, select: { id: true } })))
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    await prisma.blog.update({ where: { id: req.params.id }, data: { status: 'draft' } });
    return res.json({ success: true, message: 'Đã từ chối và chuyển về nháp' });
  } catch (err) {
    return next(err);
  }
};
