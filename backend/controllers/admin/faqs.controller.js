const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { toLegacyEntity } = require('../../repositories/core/legacyMapper');
const { faqSchema } = require('../../validators/admin/faqs.validator');

const notFound = (res) =>
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy FAQ' } });
const validationError = (res, err) =>
  res
    .status(400)
    .json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.issues?.[0]?.message || 'Dữ liệu FAQ không hợp lệ',
      },
    });
const buildScope = ({ pageType, serviceDetail }) => ({
  ...(pageType ? { page: pageType } : {}),
  ...(serviceDetail ? { serviceDetail } : {}),
});
const mapFaq = ({ categoryId, ...faq }) => ({ ...toLegacyEntity(faq), category: categoryId });

exports.getFaqs = async (req, res, next) => {
  try {
    const { skip, limit, page } = paginate(req.query, req.query);
    const { search, category } = req.query;
    const where = {
      ...buildScope(req.query),
      ...(category ? { categoryId: category } : {}),
      ...(search?.trim()
        ? {
            OR: [
              { question: { contains: search.trim() } },
              { answer: { contains: search.trim() } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.faq.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.faq.count({ where }),
    ]);
    return res.json(buildPaginationResponse(rows.map(mapFaq), total, page, limit));
  } catch (err) {
    return next(err);
  }
};
exports.getStats = async (_req, res, next) => {
  try {
    const [total, grouped] = await Promise.all([
      prisma.faq.count(),
      prisma.faq.groupBy({ by: ['page'], _count: { _all: true } }),
    ]);
    const counts = Object.fromEntries(grouped.map((item) => [item.page, item._count._all]));
    return res.json({
      success: true,
      data: {
        total,
        home: counts.home || 0,
        solutions: counts.solutions || 0,
        pricing: counts.pricing || 0,
        blog: counts.blog || 0,
      },
    });
  } catch (err) {
    return next(err);
  }
};
exports.createFaq = async (req, res, next) => {
  try {
    const data = faqSchema.parse(req.body);
    if (!['solutions', 'pricing'].includes(data.page)) delete data.serviceDetail;
    if (data.category !== undefined) {
      data.categoryId = data.category || null;
      delete data.category;
    }
    const faq = await prisma.faq.create({ data: { id: createEntityId(), ...data } });
    return res.status(201).json({ success: true, data: mapFaq(faq) });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    return next(err);
  }
};
exports.updateFaq = async (req, res, next) => {
  try {
    const data = faqSchema.parse(req.body);
    if (!['solutions', 'pricing'].includes(data.page)) data.serviceDetail = null;
    if (data.category !== undefined) {
      data.categoryId = data.category || null;
      delete data.category;
    }
    if (!(await prisma.faq.findUnique({ where: { id: req.params.id }, select: { id: true } })))
      return notFound(res);
    const faq = await prisma.faq.update({ where: { id: req.params.id }, data });
    return res.json({ success: true, data: mapFaq(faq) });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    return next(err);
  }
};
exports.deleteFaq = async (req, res, next) => {
  try {
    if (!(await prisma.faq.findUnique({ where: { id: req.params.id }, select: { id: true } })))
      return notFound(res);
    await prisma.faq.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Đã xoá FAQ' });
  } catch (err) {
    return next(err);
  }
};
exports.reorderFaqs = async (req, res, next) => {
  try {
    const { orderedIds, pageType, serviceDetail } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== 'string' || !id))
      return res
        .status(400)
        .json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Danh sách FAQ không hợp lệ' },
        });
    const scope = buildScope({ pageType, serviceDetail });
    const matched = await prisma.faq.count({ where: { ...scope, id: { in: orderedIds } } });
    if (matched !== orderedIds.length)
      return res
        .status(400)
        .json({
          success: false,
          error: { code: 'INVALID_SCOPE', message: 'Một số FAQ không thuộc phạm vi đang sắp xếp' },
        });
    const existing = await prisma.faq.findMany({
      where: scope,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: { id: true },
    });
    const positions = orderedIds
      .map((id) => existing.findIndex((item) => item.id === id))
      .filter((index) => index >= 0);
    const startOrder = positions.length ? Math.min(...positions) : 0;
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.faq.update({ where: { id }, data: { order: startOrder + index } }),
      ),
    );
    return res.json({ success: true, message: 'Đã cập nhật thứ tự FAQ' });
  } catch (err) {
    return next(err);
  }
};
exports.searchSuggestions = async (req, res, next) => {
  try {
    const search = req.query.search || req.query.q;
    if (!search?.trim()) return res.json({ success: true, data: [] });
    const rows = await prisma.faq.findMany({
      where: { question: { contains: search.trim() } },
      select: { id: true, question: true },
      take: 5,
    });
    return res.json({ success: true, data: rows.map(toLegacyEntity) });
  } catch (err) {
    return next(err);
  }
};
