const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { toLegacyEntity } = require('../../repositories/core/legacyMapper');
const { createBlogTagSchema } = require('../../validators/admin/blogs.validator');
const { z } = require('zod');
const slugify = require('slugify');

exports.getTags = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Number.parseInt(req.query.limit, 10) || 10);
    const where = req.query.search ? { name: { contains: req.query.search } } : {};
    const [tags, total] = await Promise.all([
      prisma.blogTag.findMany({
        where,
        include: { _count: { select: { blogs: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogTag.count({ where }),
    ]);
    const data = tags.map(({ _count, ...tag }) => ({
      ...toLegacyEntity(tag),
      postCount: _count.blogs,
    }));
    return res.json({
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách thẻ', error: error.message });
  }
};

exports.createTag = async (req, res) => {
  try {
    const data = createBlogTagSchema.parse(req.body);
    const slug = data.slug || slugify(data.name, { lower: true, locale: 'vi' });
    if (await prisma.blogTag.findUnique({ where: { slug }, select: { id: true } }))
      return res.status(400).json({ message: 'Slug thẻ đã tồn tại' });
    const tag = await prisma.blogTag.create({ data: { id: createEntityId(), ...data, slug } });
    return res.status(201).json({ success: true, data: toLegacyEntity(tag) });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ success: false, message: error.errors[0].message });
    return res
      .status(500)
      .json({ success: false, message: 'Lỗi khi tạo thẻ', error: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const data = createBlogTagSchema.parse(req.body);
    const slug = data.slug || slugify(data.name, { lower: true, locale: 'vi' });
    if (
      await prisma.blogTag.findFirst({
        where: { slug, id: { not: req.params.id } },
        select: { id: true },
      })
    )
      return res.status(400).json({ success: false, message: 'Slug thẻ đã tồn tại' });
    if (!(await prisma.blogTag.findUnique({ where: { id: req.params.id }, select: { id: true } })))
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ' });
    const tag = await prisma.blogTag.update({
      where: { id: req.params.id },
      data: { ...data, slug },
    });
    return res.json({ success: true, data: toLegacyEntity(tag) });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ success: false, message: error.errors[0].message });
    return res
      .status(500)
      .json({ success: false, message: 'Lỗi khi cập nhật thẻ', error: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    if (!(await prisma.blogTag.findUnique({ where: { id: req.params.id }, select: { id: true } })))
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ' });
    if (
      await prisma.blogTagOnBlog.findFirst({
        where: { tagId: req.params.id },
        select: { tagId: true },
      })
    )
      return res
        .status(400)
        .json({ success: false, message: 'Không thể xoá thẻ đang được sử dụng trong bài viết' });
    await prisma.blogTag.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Xóa thẻ thành công' });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Lỗi khi xóa thẻ', error: error.message });
  }
};
