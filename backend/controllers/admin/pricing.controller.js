const { pricingRepository } = require('../../repositories/core/contentRepository');
const { normalizeLocale } = require('../../constants/locales');
const { translatePricingPlanPreview, translatePricingComparisonPreview } = require('../../services/geminiService');

const sharedFields = ['order', 'isActive'];
const pick = (source, fields) => fields.reduce((result, field) => { if (source[field] !== undefined) result[field] = source[field]; return result; }, {});
const cleanStrings = (items) => Array.isArray(items) ? items.map((item) => String(item).trim()).filter(Boolean) : [];
const cleanPlanTranslation = (value = {}) => ({ name: String(value.name || '').trim(), price: String(value.price || '').trim(), subtitle: cleanStrings(value.subtitle), badge: String(value.badge || '').trim(), buttonText: String(value.buttonText || '').trim(), feature: cleanStrings(value.feature) });
const cleanComparisonTranslation = (value = {}) => ({ title: String(value.title || '').trim(), values: value.values && typeof value.values === 'object' ? value.values : {} });
const normalizeTranslations = (body, cleaner) => {
  const translations = body.translations || { vi: body };
  const result = { vi: cleaner(translations.vi) };
  if (translations.en) result.en = cleaner(translations.en);
  if (!result.vi.name && !result.vi.title) throw Object.assign(new Error('Nội dung tiếng Việt không được để trống'), { statusCode: 400 });
  return result;
};
const sendError = (res, error, fallbackStatus = 500) => res.status(error?.code === 'P2025' ? 404 : error.statusCode || fallbackStatus).json({ message: error?.code === 'P2025' ? 'Không tìm thấy dữ liệu' : error.message || 'Có lỗi xảy ra' });
const localeOf = (req, res) => { const locale = normalizeLocale(req.query.locale); if (!locale) res.status(400).json({ message: 'Ngôn ngữ không được hỗ trợ' }); return locale; };

exports.getPlans = async (req, res) => {
  try {
    const locale = localeOf(req, res); if (!locale) return;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const { rows, total } = await pricingRepository.listPlans({ search: req.query.search?.trim(), isActive: req.query.isActive !== undefined && req.query.isActive !== '' ? req.query.isActive === 'true' : undefined, skip: (page - 1) * limit, take: limit, locale });
    return res.json({ items: rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, requestedLocale: locale });
  } catch (error) { return sendError(res, error); }
};
exports.getStats = async (_req, res) => { try { const [totalPlans, activePlans, totalFeatures, comparisonRows] = await pricingRepository.stats(); return res.json({ totalPlans, activePlans, inactivePlans: totalPlans - activePlans, totalFeatures, comparisonRows }); } catch (error) { return sendError(res, error); } };
exports.getPlanById = async (req, res) => { try { const item = await pricingRepository.findPlan(req.params.id); return item ? res.json(item) : res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' }); } catch (error) { return sendError(res, error); } };
exports.createPlan = async (req, res) => { try { return res.status(201).json(await pricingRepository.savePlan(null, { ...pick(req.body, sharedFields), translations: normalizeTranslations(req.body, cleanPlanTranslation) })); } catch (error) { return sendError(res, error, 400); } };
exports.updatePlan = async (req, res) => { try { const existing = await pricingRepository.findPlan(req.params.id); if (!existing) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' }); const data = pick(req.body, sharedFields); if (req.body.translations || req.body.name !== undefined) data.translations = normalizeTranslations({ ...req.body, translations: { ...existing.translations, ...(req.body.translations || {}) } }, cleanPlanTranslation); return res.json(await pricingRepository.savePlan(req.params.id, data)); } catch (error) { return sendError(res, error, 400); } };
exports.deletePlan = async (req, res) => { try { if (!(await pricingRepository.findPlan(req.params.id))) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' }); await pricingRepository.deletePlan(req.params.id); return res.json({ message: 'Đã xóa gói dịch vụ' }); } catch (error) { return sendError(res, error); } };

exports.getComparisons = async (req, res) => { try { const locale = localeOf(req, res); if (!locale) return; return res.json({ items: await pricingRepository.listComparisons(locale), requestedLocale: locale }); } catch (error) { return sendError(res, error); } };
exports.getComparisonById = async (req, res) => { try { const item = await pricingRepository.findComparison(req.params.id); return item ? res.json(item) : res.status(404).json({ message: 'Không tìm thấy dòng so sánh' }); } catch (error) { return sendError(res, error); } };
exports.createComparison = async (req, res) => { try { return res.status(201).json(await pricingRepository.saveComparison(null, { order: Number(req.body.order) || 0, translations: normalizeTranslations(req.body, cleanComparisonTranslation) })); } catch (error) { return sendError(res, error, 400); } };
exports.updateComparison = async (req, res) => { try { const existing = await pricingRepository.findComparison(req.params.id); if (!existing) return res.status(404).json({ message: 'Không tìm thấy dòng so sánh' }); const data = { ...(req.body.order !== undefined ? { order: Number(req.body.order) || 0 } : {}) }; if (req.body.translations || req.body.title !== undefined) data.translations = normalizeTranslations({ ...req.body, translations: { ...existing.translations, ...(req.body.translations || {}) } }, cleanComparisonTranslation); return res.json(await pricingRepository.saveComparison(req.params.id, data)); } catch (error) { return sendError(res, error, 400); } };
exports.deleteComparison = async (req, res) => { try { if (!(await pricingRepository.findComparison(req.params.id))) return res.status(404).json({ message: 'Không tìm thấy dòng so sánh' }); await pricingRepository.deleteComparison(req.params.id); return res.json({ message: 'Đã xóa dòng so sánh' }); } catch (error) { return sendError(res, error); } };

exports.translatePreview = async (req, res) => {
  try {
    const type = req.body.type;
    const source = req.body.source;
    if (!source || !['plan', 'comparison'].includes(type)) return res.status(400).json({ message: 'Yêu cầu dịch không hợp lệ' });
    const data = type === 'plan' ? await translatePricingPlanPreview(cleanPlanTranslation(source)) : await translatePricingComparisonPreview(cleanComparisonTranslation(source));
    return res.json({ success: true, data, message: 'Bản dịch chỉ là preview và chưa được lưu' });
  } catch (error) { return sendError(res, error, 502); }
};

