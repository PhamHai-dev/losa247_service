const mongoose = require('mongoose');
const PricingPlan = require('../../models/PricingPlan.model');
const PricingComparison = require('../../models/PricingComparison.model');

const PLAN_FIELDS = ['name', 'price', 'subtitle', 'feature', 'badge', 'buttonText', 'order', 'isActive'];
const COMPARISON_FIELDS = ['title', 'values', 'order'];
const pick = (source, fields) => fields.reduce((result, field) => {
  if (source[field] !== undefined) result[field] = source[field];
  return result;
}, {});
const cleanStrings = (items) => Array.isArray(items) ? items.map((item) => String(item).trim()).filter(Boolean) : [];
const normalizePlan = (body) => {
  const data = pick(body, PLAN_FIELDS);
  if (data.subtitle !== undefined) data.subtitle = cleanStrings(data.subtitle);
  if (data.feature !== undefined) data.feature = cleanStrings(data.feature);
  return data;
};
const sendError = (res, error, fallbackStatus = 500) => {
  if (error?.name === 'CastError') return res.status(400).json({ message: 'ID không hợp lệ' });
  if (error?.name === 'ValidationError') return res.status(400).json({ message: error.message });
  return res.status(fallbackStatus).json({ message: error.message || 'Có lỗi xảy ra' });
};

// ==================== Pricing Plans ====================
exports.getPlans = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const filter = {};
    if (search?.trim()) filter.name = { $regex: search.trim(), $options: 'i' };
    if (isActive !== undefined && isActive !== '') filter.isActive = isActive === 'true';
    const [items, total] = await Promise.all([
      PricingPlan.find(filter).sort({ order: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      PricingPlan.countDocuments(filter),
    ]);
    res.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { sendError(res, error); }
};

exports.getStats = async (_req, res) => {
  try {
    const [planStats, comparisonRows] = await Promise.all([
      PricingPlan.aggregate([{ $group: { _id: null, totalPlans: { $sum: 1 }, activePlans: { $sum: { $cond: ['$isActive', 1, 0] } }, totalFeatures: { $sum: { $size: { $ifNull: ['$feature', []] } } } } }]),
      PricingComparison.countDocuments(),
    ]);
    const stats = planStats[0] || { totalPlans: 0, activePlans: 0, totalFeatures: 0 };
    res.json({ ...stats, inactivePlans: stats.totalPlans - stats.activePlans, comparisonRows });
  } catch (error) { sendError(res, error); }
};

exports.getPlanById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID không hợp lệ' });
    const item = await PricingPlan.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' });
    res.json(item);
  } catch (error) { sendError(res, error); }
};
exports.createPlan = async (req, res) => {
  try { const item = await PricingPlan.create(normalizePlan(req.body)); res.status(201).json(item); }
  catch (error) { sendError(res, error, 400); }
};
exports.updatePlan = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID không hợp lệ' });
    const item = await PricingPlan.findByIdAndUpdate(req.params.id, normalizePlan(req.body), { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' });
    res.json(item);
  } catch (error) { sendError(res, error, 400); }
};
exports.deletePlan = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID không hợp lệ' });
    const item = await PricingPlan.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' });
    await PricingComparison.updateMany({}, { $unset: { [`values.${req.params.id}`]: '' } });
    res.json({ message: 'Đã xóa gói dịch vụ' });
  } catch (error) { sendError(res, error); }
};

// ==================== Pricing Comparisons ====================
exports.getComparisons = async (_req, res) => {
  try { const items = await PricingComparison.find().sort({ order: 1, createdAt: 1 }); res.json({ items }); }
  catch (error) { sendError(res, error); }
};
exports.getComparisonById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID không hợp lệ' });
    const item = await PricingComparison.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy dòng so sánh' });
    res.json(item);
  } catch (error) { sendError(res, error); }
};
exports.createComparison = async (req, res) => {
  try { const item = await PricingComparison.create(pick(req.body, COMPARISON_FIELDS)); res.status(201).json(item); }
  catch (error) { sendError(res, error, 400); }
};
exports.updateComparison = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID không hợp lệ' });
    const item = await PricingComparison.findByIdAndUpdate(req.params.id, pick(req.body, COMPARISON_FIELDS), { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Không tìm thấy dòng so sánh' });
    res.json(item);
  } catch (error) { sendError(res, error, 400); }
};
exports.deleteComparison = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID không hợp lệ' });
    const item = await PricingComparison.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy dòng so sánh' });
    res.json({ message: 'Đã xóa dòng so sánh' });
  } catch (error) { sendError(res, error); }
};

