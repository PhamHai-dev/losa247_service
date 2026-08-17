const { prisma } = require('../../config/prisma');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { toLegacyEntity, toLegacyUser } = require('../../repositories/core/legacyMapper');

const include = {
  category: true,
  author: { select: { id: true, name: true, avatarUrl: true } },
  tags: { include: { tag: true } },
};
const mapBlog = ({ category, author, tags, ...blog }) => ({
  ...toLegacyEntity(blog),
  category: category ? toLegacyEntity(category) : null,
  author: author ? toLegacyUser(author) : null,
  tags: (tags || []).map(({ tag }) => toLegacyEntity(tag)),
});
const whereOf = ({ search, category, tag, isFeatured, excludeId }) => ({
  status: 'published',
  ...(category ? { categoryId: category } : {}),
  ...(tag ? { tags: { some: { tagId: tag } } } : {}),
  ...(isFeatured === 'true' ? { isFeatured: true } : {}),
  ...(excludeId ? { id: { not: excludeId } } : {}),
  ...(search ? { title: { contains: search } } : {}),
});

exports.getPublishedBlogs = async (req, res, next) => {
  try {
    const { skip, limit, page } = paginate(req.query, req.query);
    const where = whereOf(req.query);
    const orderBy =
      req.query.sort === 'oldest'
        ? { publishedAt: 'asc' }
        : req.query.sort === 'popular'
          ? { views: 'desc' }
          : { publishedAt: 'desc' };
    const [rows, total] = await Promise.all([
      prisma.blog.findMany({ where, include, orderBy, skip, take: limit }),
      prisma.blog.count({ where }),
    ]);
    return res.json(buildPaginationResponse(rows.map(mapBlog), total, page, limit));
  } catch (err) {
    return next(err);
  }
};
exports.getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await prisma.blog.findFirst({
      where: { slug: req.params.slug, status: 'published' },
      include,
    });
    if (!blog)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    return res.json({ success: true, data: mapBlog(blog) });
  } catch (err) {
    return next(err);
  }
};
exports.incrementView = async (req, res, next) => {
  try {
    const blog = await prisma.blog.findFirst({
      where: { slug: req.params.slug, status: 'published' },
      select: { id: true },
    });
    if (!blog)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    await prisma.blog.update({ where: { id: blog.id }, data: { views: { increment: 1 } } });
    return res.json({ success: true, message: 'Đã tăng lượt xem' });
  } catch (err) {
    return next(err);
  }
};
exports.getPublicCategories = async (_req, res, next) => {
  try {
    const rows = await prisma.blogCategory.findMany({
      include: { _count: { select: { blogs: { where: { status: 'published' } } } } },
      orderBy: { name: 'asc' },
    });
    const data = rows
      .map(({ _count, ...row }) => ({ ...toLegacyEntity(row), count: _count.blogs }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};
exports.getPublicTags = async (req, res, next) => {
  try {
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const rows = await prisma.blogTag.findMany({
      include: { _count: { select: { blogs: { where: { blog: { status: 'published' } } } } } },
    });
    const data = rows
      .map(({ _count, ...row }) => ({ ...toLegacyEntity(row), count: _count.blogs }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, limit);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};
exports.getRelatedBlogs = async (req, res, next) => {
  try {
    const blog = await prisma.blog.findFirst({
      where: { slug: req.params.slug, status: 'published' },
      include: { tags: true },
    });
    if (!blog) return res.json({ success: true, data: [] });
    const related = [];
    const tagIds = blog.tags.map(({ tagId }) => tagId);
    if (tagIds.length)
      related.push(
        ...(await prisma.blog.findMany({
          where: {
            id: { not: blog.id },
            status: 'published',
            tags: { some: { tagId: { in: tagIds } } },
          },
          include,
          orderBy: { publishedAt: 'desc' },
          take: 3,
        })),
      );
    if (related.length < 3 && blog.categoryId)
      related.push(
        ...(await prisma.blog.findMany({
          where: {
            id: { notIn: [blog.id, ...related.map(({ id }) => id)] },
            status: 'published',
            categoryId: blog.categoryId,
          },
          include,
          orderBy: { publishedAt: 'desc' },
          take: 3 - related.length,
        })),
      );
    if (related.length < 3)
      related.push(
        ...(await prisma.blog.findMany({
          where: { id: { notIn: [blog.id, ...related.map(({ id }) => id)] }, status: 'published' },
          include,
          orderBy: { publishedAt: 'desc' },
          take: 3 - related.length,
        })),
      );
    return res.json({ success: true, data: related.map(mapBlog) });
  } catch (err) {
    return next(err);
  }
};
