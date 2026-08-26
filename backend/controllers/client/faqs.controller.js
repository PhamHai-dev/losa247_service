const { prisma } = require('../../config/prisma');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { toLegacyEntity } = require('../../repositories/core/legacyMapper');
const { DEFAULT_LOCALE, normalizeLocale } = require('../../constants/locales');

const localeCandidates = (locale) => locale === DEFAULT_LOCALE ? [DEFAULT_LOCALE] : [locale, DEFAULT_LOCALE];
const pickTranslation = (translations, locale) => translations.find((item) => item.locale === locale) || translations.find((item) => item.locale === DEFAULT_LOCALE);
const mapFaq = ({ categoryId, translations, ...faq }, requestedLocale) => {
  const selected = pickTranslation(translations, requestedLocale);
  if (!selected) return null;
  const { id, faqId, locale, createdAt, updatedAt, ...content } = selected;
  return { ...toLegacyEntity(faq), ...content, category: categoryId, requestedLocale, resolvedLocale: locale, isFallback: requestedLocale !== locale };
};

exports.getFaqs = async (req, res, next) => {
  try {
    const locale = normalizeLocale(req.query.locale);
    if (!locale) return res.status(400).json({ success: false, error: { code: 'INVALID_LOCALE', message: 'Ngôn ngữ không được hỗ trợ' } });
    const { page, limit, search, category, serviceDetail, pageType } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });
    const candidates = localeCandidates(locale);
    const where = {
      ...(pageType ? { page: pageType } : {}), ...(category ? { categoryId: category } : {}), ...(serviceDetail ? { serviceDetail } : {}),
      translations: { some: { locale: { in: candidates }, ...(search ? { question: { contains: search } } : {}) } },
    };
    const [rows, total] = await Promise.all([
      prisma.faq.findMany({ where, include: { translations: { where: { locale: { in: candidates } } } }, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }], skip, take: l }),
      prisma.faq.count({ where }),
    ]);
    const data = rows.map((row) => mapFaq(row, locale)).filter(Boolean);
    const isFallback = data.some((item) => item.isFallback);
    return res.json({ ...buildPaginationResponse(data, total, p, l), requestedLocale: locale, resolvedLocale: isFallback ? DEFAULT_LOCALE : locale, isFallback });
  } catch (err) { return next(err); }
};
