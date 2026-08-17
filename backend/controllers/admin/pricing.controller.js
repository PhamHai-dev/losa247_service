const { pricingRepository } = require('../../repositories/core/contentRepository');

const PLAN_FIELDS = [
  'name',
  'price',
  'subtitle',
  'feature',
  'badge',
  'buttonText',
  'order',
  'isActive',
];
const COMPARISON_FIELDS = ['title', 'values', 'order'];
const pick = (source, fields) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) result[field] = source[field];
    return result;
  }, {});
const cleanStrings = (items) =>
  Array.isArray(items) ? items.map((item) => String(item).trim()).filter(Boolean) : [];
const normalizePlan = (body) => {
  const data = pick(body, PLAN_FIELDS);
  if (data.subtitle !== undefined) data.subtitle = cleanStrings(data.subtitle);
  if (data.feature !== undefined) data.feature = cleanStrings(data.feature);
  return data;
};
const sendError = (res, error, fallbackStatus = 500) =>
  res
    .status(error?.code === 'P2025' ? 404 : fallbackStatus)
    .json({
      message:
        error?.code === 'P2025' ? 'Không tìm thấy dữ liệu' : error.message || 'Có lỗi xảy ra',
    });

exports.getPlans = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const { rows, total } = await pricingRepository.listPlans({
      search: req.query.search?.trim(),
      isActive:
        req.query.isActive !== undefined && req.query.isActive !== ''
          ? req.query.isActive === 'true'
          : undefined,
      skip: (page - 1) * limit,
      take: limit,
    });
    return res.json({
      items: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return sendError(res, error);
  }
};
exports.getStats = async (_req, res) => {
  try {
    const [totalPlans, activePlans, totalFeatures, comparisonRows] =
      await pricingRepository.stats();
    return res.json({
      totalPlans,
      activePlans,
      inactivePlans: totalPlans - activePlans,
      totalFeatures,
      comparisonRows,
    });
  } catch (error) {
    return sendError(res, error);
  }
};
exports.getPlanById = async (req, res) => {
  try {
    const item = await pricingRepository.findPlan(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' });
    return res.json(item);
  } catch (error) {
    return sendError(res, error);
  }
};
exports.createPlan = async (req, res) => {
  try {
    return res.status(201).json(await pricingRepository.savePlan(null, normalizePlan(req.body)));
  } catch (error) {
    return sendError(res, error, 400);
  }
};
exports.updatePlan = async (req, res) => {
  try {
    if (!(await pricingRepository.findPlan(req.params.id)))
      return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' });
    return res.json(await pricingRepository.savePlan(req.params.id, normalizePlan(req.body)));
  } catch (error) {
    return sendError(res, error, 400);
  }
};
exports.deletePlan = async (req, res) => {
  try {
    if (!(await pricingRepository.findPlan(req.params.id)))
      return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' });
    await pricingRepository.deletePlan(req.params.id);
    return res.json({ message: 'Đã xóa gói dịch vụ' });
  } catch (error) {
    return sendError(res, error);
  }
};
exports.getComparisons = async (_req, res) => {
  try {
    return res.json({ items: await pricingRepository.listComparisons() });
  } catch (error) {
    return sendError(res, error);
  }
};
exports.getComparisonById = async (req, res) => {
  try {
    const item = await pricingRepository.findComparison(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy dòng so sánh' });
    return res.json(item);
  } catch (error) {
    return sendError(res, error);
  }
};
exports.createComparison = async (req, res) => {
  try {
    return res
      .status(201)
      .json(await pricingRepository.saveComparison(null, pick(req.body, COMPARISON_FIELDS)));
  } catch (error) {
    return sendError(res, error, 400);
  }
};
exports.updateComparison = async (req, res) => {
  try {
    if (!(await pricingRepository.findComparison(req.params.id)))
      return res.status(404).json({ message: 'Không tìm thấy dòng so sánh' });
    return res.json(
      await pricingRepository.saveComparison(req.params.id, pick(req.body, COMPARISON_FIELDS)),
    );
  } catch (error) {
    return sendError(res, error, 400);
  }
};
exports.deleteComparison = async (req, res) => {
  try {
    if (!(await pricingRepository.findComparison(req.params.id)))
      return res.status(404).json({ message: 'Không tìm thấy dòng so sánh' });
    await pricingRepository.deleteComparison(req.params.id);
    return res.json({ message: 'Đã xóa dòng so sánh' });
  } catch (error) {
    return sendError(res, error);
  }
};
