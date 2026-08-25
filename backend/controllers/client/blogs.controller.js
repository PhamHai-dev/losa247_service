const { prisma } = require('../../config/prisma');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { toLegacyEntity, toLegacyUser } = require('../../repositories/core/legacyMapper');
const { DEFAULT_LOCALE, normalizeLocale, publicTranslationWhere } = require('../../constants/locales');

const getLocale = (req, res) => {
  const locale = normalizeLocale(req.query.locale);
  if (!locale) res.status(400).json({ success: false, error: { code: 'INVALID_LOCALE', message: 'Ngôn ngữ không được hỗ trợ' } });
  return locale;
};
const localeCandidates = (locale) => locale === DEFAULT_LOCALE ? [DEFAULT_LOCALE] : [locale, DEFAULT_LOCALE];
const translationIsPublic = (translation, now = new Date()) => translation && (translation.status === 'published' || (translation.status === 'scheduled' && translation.publishedAt && new Date(translation.publishedAt) <= now));
const pickTranslation = (translations, requestedLocale, now = new Date()) =>
  translations.find((item) => item.locale === requestedLocale && translationIsPublic(item, now))
  || translations.find((item) => item.locale === DEFAULT_LOCALE && translationIsPublic(item, now));
const pickTaxonomyTranslation = (translations, requestedLocale) =>
  translations.find((item) => item.locale === requestedLocale)
  || translations.find((item) => item.locale === DEFAULT_LOCALE);
const localeMeta = (requestedLocale, resolvedLocale) => ({ requestedLocale, resolvedLocale, isFallback: requestedLocale !== resolvedLocale });
const includeFor = (locale, now) => ({
  translations: { where: { OR: localeCandidates(locale).map((candidate) => publicTranslationWhere(candidate, now)) } },
  category: { include: { translations: { where: { locale: { in: localeCandidates(locale) } } } } },
  author: { select: { id: true, name: true, avatarUrl: true } },
  tags: { include: { tag: { include: { translations: { where: { locale: { in: localeCandidates(locale) } } } } } } },
});
const localizedFields = (translation) => {
  if (!translation) return {};
  const { id, blogId, categoryId, tagId, locale, createdAt, updatedAt, ...fields } = translation;
  return fields;
};
const mapTaxonomy = (entity, requestedLocale) => {
  const selected = pickTaxonomyTranslation(entity?.translations || [], requestedLocale);
  if (!selected) return null;
  const { translations, ...base } = entity;
  return { ...toLegacyEntity(base), ...localizedFields(selected), ...localeMeta(requestedLocale, selected.locale) };
};
const mapBlog = ({ translations, category, author, tags, ...blog }, requestedLocale, now = new Date()) => {
  const selected = pickTranslation(translations || [], requestedLocale, now);
  if (!selected) return null;
  const alternates = Object.fromEntries((translations || []).filter((item) => translationIsPublic(item, now)).map((item) => [item.locale, { locale: item.locale, slug: item.slug, path: `${item.locale === 'en' ? '/en' : ''}/blog/${item.slug}` }]));
  return {
    ...toLegacyEntity(blog), ...localizedFields(selected),
    category: mapTaxonomy(category, requestedLocale), author: author ? toLegacyUser(author) : null,
    tags: (tags || []).map(({ tag }) => mapTaxonomy(tag, requestedLocale)).filter(Boolean),
    alternates, ...localeMeta(requestedLocale, selected.locale),
  };
};
const publicSome = (locale, now, extra = {}) => ({ ...publicTranslationWhere(locale, now), ...extra });
const whereOf = ({ locale, now, search, category, tag, isFeatured, excludeId }) => ({
  translations: { some: publicSome(locale, now, search ? { title: { contains: search } } : {}) },
  ...(category ? { categoryId: category } : {}), ...(tag ? { tags: { some: { tagId: tag } } } : {}),
  ...(isFeatured === 'true' ? { isFeatured: true } : {}), ...(excludeId ? { id: { not: excludeId } } : {}),
});
const withMeta = (response, requestedLocale, data) => {
  const isFallback = data.some((item) => item?.isFallback);
  return { ...response, requestedLocale, resolvedLocale: isFallback ? DEFAULT_LOCALE : requestedLocale, isFallback };
};

exports.getPublishedBlogs = async (req, res, next) => {
  try {
    const locale = getLocale(req, res); if (!locale) return undefined;
    const now = new Date(); const { skip, limit, page } = paginate(req.query, req.query); const where = whereOf({ ...req.query, locale, now });
    const orderBy = req.query.sort === 'popular' ? { views: 'desc' } : { createdAt: req.query.sort === 'oldest' ? 'asc' : 'desc' };
    const [rows, total] = await Promise.all([prisma.blog.findMany({ where, include: includeFor(locale, now), orderBy, skip, take: limit }), prisma.blog.count({ where })]);
    const data = rows.map((row) => mapBlog(row, locale, now)).filter(Boolean);
    return res.json(withMeta(buildPaginationResponse(data, total, page, limit), locale, data));
  } catch (err) { return next(err); }
};
exports.getBlogBySlug = async (req, res, next) => {
  try {
    const locale = getLocale(req, res); if (!locale) return undefined; const now = new Date();
    const translation = await prisma.blogTranslation.findFirst({ where: { slug: req.params.slug, OR: localeCandidates(locale).map((candidate) => publicTranslationWhere(candidate, now)) }, select: { blogId: true } });
    if (!translation) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    const blog = await prisma.blog.findUnique({ where: { id: translation.blogId }, include: includeFor(locale, now) });
    const data = mapBlog(blog, locale, now); return res.json({ success: true, data, ...localeMeta(locale, data.resolvedLocale) });
  } catch (err) { return next(err); }
};
exports.incrementView = async (req, res, next) => {
  try {
    const locale = getLocale(req, res); if (!locale) return undefined;
    const translation = await prisma.blogTranslation.findFirst({ where: { slug: req.params.slug, OR: localeCandidates(locale).map((candidate) => publicTranslationWhere(candidate)) }, select: { blogId: true } });
    if (!translation) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
    await prisma.blog.update({ where: { id: translation.blogId }, data: { views: { increment: 1 } } }); return res.json({ success: true, message: 'Đã tăng lượt xem' });
  } catch (err) { return next(err); }
};
const getTaxonomy = async (model, relation, locale, now, throughBlogRelation = false) => {
  const publicBlogWhere = { translations: { some: publicSome(locale, now) } };
  const rows = await model.findMany({
    where: { translations: { some: { locale: { in: localeCandidates(locale) } } } },
    include: {
      translations: true,
      _count: {
        select: {
          [relation]: { where: throughBlogRelation ? { blog: publicBlogWhere } : publicBlogWhere },
        },
      },
    },
  });
  return rows.map(({ _count, ...row }) => {
    const mapped = mapTaxonomy(row, locale); if (!mapped) return null;
    mapped.alternates = Object.fromEntries(row.translations.map((item) => [item.locale, { locale: item.locale, slug: item.slug, path: `${item.locale === 'en' ? '/en' : ''}/tag/${item.slug}` }]));
    return { ...mapped, count: _count[relation] };
  }).filter(Boolean).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};
exports.getPublicCategories = async (req, res, next) => { try { const locale = getLocale(req, res); if (!locale) return undefined; const data = await getTaxonomy(prisma.blogCategory, 'blogs', locale, new Date()); return res.json(withMeta({ success: true, data }, locale, data)); } catch (err) { return next(err); } };
exports.getPublicTags = async (req, res, next) => { try { const locale = getLocale(req, res); if (!locale) return undefined; const limit = Number.parseInt(req.query.limit, 10) || 20; const data = (await getTaxonomy(prisma.blogTag, 'blogs', locale, new Date(), true)).slice(0, limit); return res.json(withMeta({ success: true, data }, locale, data)); } catch (err) { return next(err); } };
exports.getRelatedBlogs = async (req, res, next) => {
  try {
    const locale = getLocale(req, res); if (!locale) return undefined; const now = new Date();
    const sourceTranslation = await prisma.blogTranslation.findFirst({ where: { slug: req.params.slug, OR: localeCandidates(locale).map((candidate) => publicTranslationWhere(candidate, now)) }, select: { blogId: true } });
    if (!sourceTranslation) return res.json({ success: true, data: [], ...localeMeta(locale, locale) });
    const blog = await prisma.blog.findUnique({ where: { id: sourceTranslation.blogId }, include: { tags: true } }); const tagIds = blog.tags.map(({ tagId }) => tagId); const common = whereOf({ locale, now, excludeId: blog.id });
    const candidates = await prisma.blog.findMany({ where: { ...common, OR: [...(tagIds.length ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []), ...(blog.categoryId ? [{ categoryId: blog.categoryId }] : []), { id: { not: blog.id } }] }, include: includeFor(locale, now), orderBy: { createdAt: 'desc' }, take: 12 });
    candidates.sort((a, b) => Number(b.categoryId === blog.categoryId) - Number(a.categoryId === blog.categoryId)); const data = candidates.slice(0, 3).map((row) => mapBlog(row, locale, now)).filter(Boolean);
    return res.json(withMeta({ success: true, data }, locale, data));
  } catch (err) { return next(err); }
};
