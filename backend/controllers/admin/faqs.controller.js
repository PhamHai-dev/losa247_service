const mongoose = require('mongoose');
const Faq = require('../../models/Faq.model');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { faqSchema } = require('../../validators/admin/faqs.validator');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const validId = (id) => mongoose.isValidObjectId(id);
const notFound = (res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy FAQ' } });
const validationError = (res, err) => res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.issues?.[0]?.message || 'Dữ liệu FAQ không hợp lệ' } });
const buildScope = ({ pageType, serviceDetail }) => {
  const scope = {};
  if (pageType) scope.page = pageType;
  if (serviceDetail) scope.serviceDetail = serviceDetail;
  return scope;
};

exports.getFaqs = async (req, res, next) => {
  try {
    const { page, limit, search, category, serviceDetail, pageType } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });
    const filter = buildScope({ pageType, serviceDetail });
    if (category && validId(category)) filter.category = category;
    if (search?.trim()) {
      const regex = { $regex: escapeRegex(search.trim()), $options: 'i' };
      filter.$or = [{ question: regex }, { answer: regex }];
    }

    const [data, total] = await Promise.all([
      Faq.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(l).lean(),
      Faq.countDocuments(filter),
    ]);
    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) { next(err); }
};

exports.getStats = async (_req, res, next) => {
  try {
    const [total, byPage] = await Promise.all([
      Faq.countDocuments(),
      Faq.aggregate([{ $group: { _id: '$page', count: { $sum: 1 } } }]),
    ]);
    const counts = Object.fromEntries(byPage.map(({ _id, count }) => [_id, count]));
    res.json({ success: true, data: {
      total,
      home: counts.home || 0,
      solutions: counts.solutions || 0,
      pricing: counts.pricing || 0,
      blog: counts.blog || 0,
    } });
  } catch (err) { next(err); }
};

exports.createFaq = async (req, res, next) => {
  try {
    const data = faqSchema.parse(req.body);
    if (!['solutions', 'pricing'].includes(data.page)) delete data.serviceDetail;
    const faq = await Faq.create(data);
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    next(err);
  }
};

exports.updateFaq = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return notFound(res);
    const data = faqSchema.parse(req.body);
    if (!['solutions', 'pricing'].includes(data.page)) data.serviceDetail = undefined;
    const faq = await Faq.findByIdAndUpdate(req.params.id, { $set: data, ...(!data.serviceDetail && { $unset: { serviceDetail: 1 } }) }, { new: true, runValidators: true });
    if (!faq) return notFound(res);
    res.json({ success: true, data: faq });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    next(err);
  }
};

exports.deleteFaq = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return notFound(res);
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) return notFound(res);
    res.json({ success: true, message: 'Đã xoá FAQ' });
  } catch (err) { next(err); }
};

exports.reorderFaqs = async (req, res, next) => {
  try {
    const { orderedIds, pageType, serviceDetail } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.some((id) => !validId(id))) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Danh sách FAQ không hợp lệ' } });
    }
    const scope = buildScope({ pageType, serviceDetail });
    const matched = await Faq.countDocuments({ ...scope, _id: { $in: orderedIds } });
    if (matched !== orderedIds.length) return res.status(400).json({ success: false, error: { code: 'INVALID_SCOPE', message: 'Một số FAQ không thuộc phạm vi đang sắp xếp' } });
    const existing = await Faq.find(scope).sort({ order: 1, createdAt: -1 }).select('_id').lean();
    const rank = new Map(orderedIds.map((id, index) => [String(id), index]));
    const affected = existing.filter(({ _id }) => rank.has(String(_id)));
    const startOrder = affected.length ? Math.min(...affected.map(({ _id }) => existing.findIndex((item) => String(item._id) === String(_id)))) : 0;
    await Faq.bulkWrite(orderedIds.map((id, index) => ({ updateOne: { filter: { _id: id, ...scope }, update: { order: startOrder + index } } })));
    res.json({ success: true, message: 'Đã cập nhật thứ tự FAQ' });
  } catch (err) { next(err); }
};

exports.searchSuggestions = async (req, res, next) => {
  try {
    const search = req.query.search || req.query.q;
    if (!search?.trim()) return res.json({ success: true, data: [] });
    const faqs = await Faq.find({ question: { $regex: escapeRegex(search.trim()), $options: 'i' } }).select('question').limit(5).lean();
    res.json({ success: true, data: faqs });
  } catch (err) { next(err); }
};

