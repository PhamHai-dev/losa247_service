const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { toLegacyEntity } = require('../../repositories/core/legacyMapper');
const { createBlogTagSchema } = require('../../validators/admin/blogs.validator');
const { z } = require('zod');
const slugify = require('slugify');

const normalize = (value, locale) => ({ ...value, slug: value.slug || slugify(value.name, { lower: true, locale }) });
const mapTag = ({ translations, ...tag }) => {
  const vi = translations.find((item) => item.locale === 'vi') || translations[0];
  const mappedTag = toLegacyEntity(tag);
  const mappedTranslation = toLegacyEntity(vi);
  return {
    ...mappedTag,
    ...mappedTranslation,
    _id: mappedTag._id,
    id: mappedTag.id,
    translations: Object.fromEntries(translations.map((item) => [item.locale, toLegacyEntity(item)])),
  };
};
const hasSlug = (locale, slug, tagId) => prisma.blogTagTranslation.findFirst({ where: { locale, slug, ...(tagId ? { tagId: { not: tagId } } : {}) }, select: { id: true } });

exports.getTags = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1); const limit = Math.max(1, Number.parseInt(req.query.limit, 10) || 10);
    const where = req.query.search ? { translations: { some: { locale: 'vi', name: { contains: req.query.search } } } } : {};
    const [tags, total] = await Promise.all([
      prisma.blogTag.findMany({ where, include: { translations: true, _count: { select: { blogs: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.blogTag.count({ where }),
    ]);
    const data = tags.map(({ _count, ...tag }) => ({ ...mapTag(tag), postCount: _count.blogs }));
    return res.json({ success: true, data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) { return res.status(500).json({ message: 'Lỗi khi lấy danh sách thẻ', error: error.message }); }
};
exports.createTag = async (req, res) => {
  try {
    const { translations } = createBlogTagSchema.parse(req.body); const rows = Object.entries(translations).map(([locale, value]) => ({ locale, ...normalize(value, locale) }));
    for (const row of rows) if (await hasSlug(row.locale, row.slug)) return res.status(409).json({ success: false, message: `Slug ${row.locale} đã tồn tại` });
    const tag = await prisma.blogTag.create({ data: { id: createEntityId(), translations: { create: rows } }, include: { translations: true } });
    return res.status(201).json({ success: true, data: mapTag(tag) });
  } catch (error) { if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message }); return res.status(500).json({ success: false, message: 'Lỗi khi tạo thẻ', error: error.message }); }
};
exports.updateTag = async (req, res) => {
  try {
    const id = req.params.id; const { translations } = createBlogTagSchema.parse(req.body);
    if (!(await prisma.blogTag.findUnique({ where: { id }, select: { id: true } }))) return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ' });
    const rows = Object.entries(translations).map(([locale, value]) => ({ locale, ...normalize(value, locale) }));
    for (const row of rows) if (await hasSlug(row.locale, row.slug, id)) return res.status(409).json({ success: false, message: `Slug ${row.locale} đã tồn tại` });
    await prisma.$transaction(rows.map(({ locale, ...data }) => prisma.blogTagTranslation.upsert({ where: { tagId_locale: { tagId: id, locale } }, create: { tagId: id, locale, ...data }, update: data })));
    const tag = await prisma.blogTag.findUnique({ where: { id }, include: { translations: true } }); return res.json({ success: true, data: mapTag(tag) });
  } catch (error) { if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message }); return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật thẻ', error: error.message }); }
};
exports.deleteTag = async (req, res) => {
  try {
    const id = req.params.id;
    if (!(await prisma.blogTag.findUnique({ where: { id }, select: { id: true } }))) return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ' });
    if (await prisma.blogTagOnBlog.findFirst({ where: { tagId: id }, select: { tagId: true } })) return res.status(400).json({ success: false, message: 'Không thể xoá thẻ đang được sử dụng trong bài viết' });
    await prisma.blogTag.delete({ where: { id } }); return res.json({ success: true, message: 'Xóa thẻ thành công' });
  } catch (error) { return res.status(500).json({ success: false, message: 'Lỗi khi xóa thẻ', error: error.message }); }
};
