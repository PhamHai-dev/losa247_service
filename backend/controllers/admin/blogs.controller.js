const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { toLegacyEntity, toLegacyUser } = require('../../repositories/core/legacyMapper');
const { paginate, buildPaginationResponse, generateSlug } = require('../../helpers/format');
const { createBlogSchema, createBlogCategorySchema, translatePreviewSchema } = require('../../validators/admin/blogs.validator');
const { translateBlogPreview } = require('../../services/geminiService');

const translationMap = (rows = []) => Object.fromEntries(rows.map((row) => [row.locale, toLegacyEntity(row)]));
const normalizeTranslation = (value) => ({
  ...value,
  slug: value.slug || generateSlug(value.title || value.name),
  publishedAt: value.status === 'published' && !value.publishedAt ? new Date() : value.publishedAt || null,
});
const normalizeCategoryTranslation = (value) => ({
  name: value.name,
  slug: value.slug || generateSlug(value.name),
});
const include = {
  translations: true,
  category: { include: { translations: true } },
  author: { select: { id: true, name: true } },
  tags: { include: { tag: { include: { translations: true } } } },
};
const mergeLocalizedEntity = (base, translation) => {
  const mappedBase = toLegacyEntity(base);
  if (!translation) return mappedBase;
  const mappedTranslation = toLegacyEntity(translation);
  return {
    ...mappedBase,
    ...mappedTranslation,
    _id: mappedBase._id,
    id: mappedBase.id,
  };
};
const localizedTaxonomy = (entity, locale = 'vi') => {
  if (!entity) return null;
  const { translations, ...base } = entity;
  const translation = translations.find((item) => item.locale === locale) || translations[0];
  return translation ? { ...mergeLocalizedEntity(base, translation), translations: translationMap(translations) } : null;
};
const mapBlog = ({ translations, category, author, tags, ...blog }, locale = 'vi') => {
  const localized = translations.find((item) => item.locale === locale) || translations[0];
  return {
    ...mergeLocalizedEntity(blog, localized),
    translations: translationMap(translations),
    category: localizedTaxonomy(category, locale),
    author: author ? toLegacyUser(author) : null,
    tags: (tags || []).map(({ tag }) => localizedTaxonomy(tag, locale)).filter(Boolean),
  };
};
const validationError = (res, err) => res.status(400).json({
  success: false,
  error: { code: 'VALIDATION_ERROR', message: err.errors[0].message },
});
const slugConflict = async (model, locale, slug, entityKey, entityId) => prisma[model].findFirst({
  where: { locale, slug, ...(entityId ? { [entityKey]: { not: entityId } } : {}) },
  select: { id: true },
});
const assertTagsExist = async (tagIds = []) => {
  const uniqueTagIds = [...new Set(tagIds)];
  if (!uniqueTagIds.length) return null;
  const count = await prisma.blogTag.count({ where: { id: { in: uniqueTagIds } } });
  return count === uniqueTagIds.length ? null : 'Một hoặc nhiều thẻ không còn tồn tại. Vui lòng chọn lại thẻ.';
};

const assertEnglishTaxonomy = async (categoryId, tagIds) => {
  if (categoryId) {
    const category = await prisma.blogCategoryTranslation.findUnique({
      where: { categoryId_locale: { categoryId, locale: 'en' } }, select: { id: true },
    });
    if (!category) return 'Danh mục chưa có bản English';
  }
  if (tagIds.length) {
    const count = await prisma.blogTagTranslation.count({ where: { tagId: { in: tagIds }, locale: 'en' } });
    if (count !== tagIds.length) return 'Một hoặc nhiều thẻ chưa có bản English';
  }
  return null;
};

exports.getCategories = async (_req, res, next) => {
  try {
    const rows = await prisma.blogCategory.findMany({ include: { translations: true, _count: { select: { blogs: true } } }, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: rows.map(({ _count, ...row }) => ({ ...localizedTaxonomy(row), blogCount: _count.blogs })) });
  } catch (err) { return next(err); }
};
exports.createCategory = async (req, res, next) => {
  try {
    const { translations } = createBlogCategorySchema.parse(req.body);
    const values = Object.entries(translations).map(([locale, value]) => ({ locale, ...normalizeCategoryTranslation(value) }));
    for (const value of values) if (await slugConflict('blogCategoryTranslation', value.locale, value.slug, 'categoryId')) return res.status(409).json({ success: false, error: { code: 'SLUG_EXISTS', message: `Slug ${value.locale} đã tồn tại` } });
    const category = await prisma.blogCategory.create({ data: { id: createEntityId(), translations: { create: values } }, include: { translations: true } });
    return res.status(201).json({ success: true, data: localizedTaxonomy(category) });
  } catch (err) { if (err.name === 'ZodError') return validationError(res, err); return next(err); }
};
exports.updateCategory = async (req, res, next) => {
  try {
    const { translations } = createBlogCategorySchema.parse(req.body);
    const id = req.params.id;
    if (!(await prisma.blogCategory.findUnique({ where: { id }, select: { id: true } }))) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy danh mục' } });
    const values = Object.entries(translations).map(([locale, value]) => ({ locale, ...normalizeCategoryTranslation(value) }));
    for (const value of values) if (await slugConflict('blogCategoryTranslation', value.locale, value.slug, 'categoryId', id)) return res.status(409).json({ success: false, error: { code: 'SLUG_EXISTS', message: `Slug ${value.locale} đã tồn tại` } });
    await prisma.$transaction(values.map(({ locale, ...data }) => prisma.blogCategoryTranslation.upsert({ where: { categoryId_locale: { categoryId: id, locale } }, create: { categoryId: id, locale, ...data }, update: data })));
    const category = await prisma.blogCategory.findUnique({ where: { id }, include: { translations: true } });
    return res.json({ success: true, data: localizedTaxonomy(category) });
  } catch (err) { if (err.name === 'ZodError') return validationError(res, err); return next(err); }
};
exports.deleteCategory = async (req, res, next) => { try { await prisma.blogCategory.delete({ where: { id: req.params.id } }); return res.json({ success: true, message: 'Đã xoá danh mục' }); } catch (err) { return next(err); } };

exports.getStats = async (_req, res, next) => {
  try {
    const [totalBlogs, publishedBlogs, draftBlogs, scheduledBlogs, views] = await Promise.all([
      prisma.blog.count(),
      prisma.blog.count({ where: { translations: { some: { locale: 'vi', status: 'published' } } } }),
      prisma.blog.count({ where: { translations: { some: { locale: 'vi', status: 'draft' } } } }),
      prisma.blog.count({ where: { translations: { some: { locale: 'vi', status: 'scheduled' } } } }),
      prisma.blog.aggregate({ _sum: { views: true } }),
    ]);
    return res.json({ success: true, data: { totalBlogs, draftBlogs, scheduledBlogs, publishedBlogs, totalViews: views._sum.views || 0 } });
  } catch (err) { return next(err); }
};
exports.translatePreview = async (req, res, next) => {
  try {
    const source = translatePreviewSchema.parse(req.body);
    const preview = await translateBlogPreview(source);
    return res.json({ success: true, data: preview, message: 'Bản dịch chỉ là preview và chưa được lưu' });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code || 'GEMINI_ERROR', message: err.message } });
    return next(err);
  }
};

exports.getBlogs = async (req, res, next) => {
  try {
    const { skip, limit, page } = paginate(req.query, req.query);
    const { search, status, source, category, missingEnglish } = req.query;
    const where = {
      ...(source ? { source } : {}), ...(category ? { categoryId: category } : {}),
      translations: { some: { locale: 'vi', ...(status ? { status } : {}), ...(search ? { title: { contains: search } } : {}) } },
      ...(missingEnglish === 'true' ? { NOT: { translations: { some: { locale: 'en' } } } } : {}),
    };
    const [rows, total] = await Promise.all([prisma.blog.findMany({ where, include, orderBy: { createdAt: 'desc' }, skip, take: limit }), prisma.blog.count({ where })]);
    return res.json(buildPaginationResponse(rows.map((row) => mapBlog(row)), total, page, limit));
  } catch (err) { return next(err); }
};
exports.createBlog = async (req, res, next) => {
  try {
    const parsed = createBlogSchema.parse(req.body);
    const { translations, tags = [], category, ...shared } = parsed;
    const invalidTagsMessage = await assertTagsExist(tags);
    if (invalidTagsMessage) return res.status(400).json({ success: false, error: { code: 'INVALID_TAGS', message: invalidTagsMessage } });
    if (translations.en && translations.en.status !== 'draft') { const reason = await assertEnglishTaxonomy(category, tags); if (reason) return res.status(409).json({ success: false, error: { code: 'ENGLISH_TAXONOMY_REQUIRED', message: reason } }); }
    const rows = Object.entries(translations).map(([locale, value]) => ({ locale, ...normalizeTranslation(value) }));
    for (const row of rows) if (await slugConflict('blogTranslation', row.locale, row.slug, 'blogId')) return res.status(409).json({ success: false, error: { code: 'SLUG_EXISTS', message: `Slug ${row.locale} đã tồn tại` } });
    const blog = await prisma.blog.create({ data: { id: createEntityId(), ...shared, categoryId: category || null, authorId: req.user._id, translations: { create: rows }, tags: { create: tags.map((tagId) => ({ tagId })) } }, include });
    return res.status(201).json({ success: true, data: mapBlog(blog) });
  } catch (err) { if (err.name === 'ZodError') return validationError(res, err); return next(err); }
};
exports.updateBlog = async (req, res, next) => {
  try {
    const parsed = createBlogSchema.parse(req.body); const id = req.params.id;
    if (!(await prisma.blog.findUnique({ where: { id }, select: { id: true } }))) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    const { translations, tags = [], category, ...shared } = parsed;
    const invalidTagsMessage = await assertTagsExist(tags);
    if (invalidTagsMessage) return res.status(400).json({ success: false, error: { code: 'INVALID_TAGS', message: invalidTagsMessage } });
    if (translations.en && translations.en.status !== 'draft') { const reason = await assertEnglishTaxonomy(category, tags); if (reason) return res.status(409).json({ success: false, error: { code: 'ENGLISH_TAXONOMY_REQUIRED', message: reason } }); }
    const rows = Object.entries(translations).map(([locale, value]) => ({ locale, ...normalizeTranslation(value) }));
    for (const row of rows) if (await slugConflict('blogTranslation', row.locale, row.slug, 'blogId', id)) return res.status(409).json({ success: false, error: { code: 'SLUG_EXISTS', message: `Slug ${row.locale} đã tồn tại` } });
    await prisma.$transaction(async (tx) => {
      await tx.blog.update({ where: { id }, data: { ...shared, categoryId: category || null, tags: { deleteMany: {}, create: tags.map((tagId) => ({ tagId })) } } });
      for (const { locale, ...data } of rows) await tx.blogTranslation.upsert({ where: { blogId_locale: { blogId: id, locale } }, create: { blogId: id, locale, ...data }, update: data });
    });
    const blog = await prisma.blog.findUnique({ where: { id }, include }); return res.json({ success: true, data: mapBlog(blog) });
  } catch (err) { if (err.name === 'ZodError') return validationError(res, err); return next(err); }
};
exports.deleteTranslation = async (req, res, next) => { try { if (req.params.locale === 'vi') return res.status(400).json({ success: false, error: { code: 'SOURCE_REQUIRED', message: 'Không thể xóa bản tiếng Việt' } }); await prisma.blogTranslation.delete({ where: { blogId_locale: { blogId: req.params.id, locale: req.params.locale } } }); return res.json({ success: true, message: 'Đã xóa bản dịch' }); } catch (err) { return next(err); } };
exports.deleteBlog = async (req, res, next) => { try { await prisma.blog.delete({ where: { id: req.params.id } }); return res.json({ success: true, message: 'Đã xoá bài viết' }); } catch (err) { return next(err); } };
exports.approveBlog = async (req, res, next) => { req.body = { ...req.body, locale: req.body.locale || 'vi' }; try { await prisma.blogTranslation.update({ where: { blogId_locale: { blogId: req.params.id, locale: req.body.locale } }, data: { status: 'published', publishedAt: new Date() } }); return res.json({ success: true, message: 'Đã xuất bản' }); } catch (err) { return next(err); } };
exports.rejectBlog = async (req, res, next) => { try { await prisma.blogTranslation.update({ where: { blogId_locale: { blogId: req.params.id, locale: req.body.locale || 'vi' } }, data: { status: 'draft', publishedAt: null } }); return res.json({ success: true, message: 'Đã chuyển về nháp' }); } catch (err) { return next(err); } };
