const { prisma } = require('../../config/prisma');
const { createEntityId } = require('./entityId');
const { toLegacyEntity } = require('./legacyMapper');

const mapFaq = (row) => row && toLegacyEntity({ ...row, category: row.categoryId });
const parseComparisonValues = (values) => {
  if (values && typeof values === 'object' && !Array.isArray(values)) return values;
  if (typeof values !== 'string' || !values.trim()) return {};
  try {
    const parsed = JSON.parse(values);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
};
const translationMap = (rows = [], mapper) => Object.fromEntries(rows.map((row) => [row.locale, mapper(row)]));
const mapPlanTranslation = ({ id, planId, locale, createdAt, updatedAt, features, priceLabel, ...fields }) => ({
  ...fields, price: priceLabel || '', subtitle: Array.isArray(fields.subtitle) ? fields.subtitle : [], feature: Array.isArray(features) ? features : [],
});
const mapPlan = (row, locale) => {
  if (!row) return null;
  const { translations = [], ...plan } = row;
  const selected = translations.find((item) => item.locale === locale) || translations.find((item) => item.locale === 'vi');
  const localized = selected ? mapPlanTranslation(selected) : { name: '', price: '', subtitle: [], badge: '', buttonText: '', feature: [] };
  return toLegacyEntity({ ...plan, ...localized, translations: translationMap(translations, mapPlanTranslation), hasEnglish: translations.some((item) => item.locale === 'en'), resolvedLocale: selected?.locale || 'vi' });
};
const mapComparisonTranslation = ({ id, comparisonId, locale, createdAt, updatedAt, title, values }) => ({ title, values: parseComparisonValues(values) });
const mapComparison = (row, locale) => {
  if (!row) return null;
  const { translations = [], ...comparison } = row;
  const selected = translations.find((item) => item.locale === locale) || translations.find((item) => item.locale === 'vi');
  const localized = selected ? mapComparisonTranslation(selected) : { title: row.title, values: parseComparisonValues(row.values) };
  return toLegacyEntity({ ...comparison, ...localized, translations: translationMap(translations, mapComparisonTranslation), hasEnglish: translations.some((item) => item.locale === 'en'), resolvedLocale: selected?.locale || 'vi' });
};
const serializeComparisonValues = (values) => JSON.stringify(parseComparisonValues(values));
const mapSettings = (row) => ({
  _id: row.id,
  id: row.id,
  appearance: { themeMode: row.themeMode, accentColor: row.accentColor },
  siteInfo: {
    name: row.siteName,
    slogan: row.slogan,
    logoUrl: row.logoUrl,
    faviconUrl: row.faviconUrl,
    hotline: row.hotline,
    email: row.email,
    address: row.address,
    socialLinks: { facebook: row.facebookUrl, zalo: row.zaloUrl },
  },
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const faqWhere = ({ pageType, page, serviceDetail, category, search } = {}) => ({
  ...(pageType || page ? { page: pageType || page } : {}),
  ...(serviceDetail ? { serviceDetail } : {}),
  ...(category ? { categoryId: category } : {}),
  ...(search ? { OR: [{ question: { contains: search } }, { answer: { contains: search } }] } : {}),
});

const faqRepository = {
  async list(filter, skip, take) {
    const where = faqWhere(filter);
    const [rows, total] = await Promise.all([
      prisma.faq.findMany({
        where,
        skip,
        take,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.faq.count({ where }),
    ]);
    return { rows: rows.map(mapFaq), total };
  },
  async stats() {
    return Promise.all([
      prisma.faq.count(),
      prisma.faq.groupBy({ by: ['page'], _count: { _all: true } }),
    ]);
  },
  async create(data) {
    const { category, ...rest } = data;
    return mapFaq(
      await prisma.faq.create({
        data: { id: createEntityId(), ...rest, categoryId: category || null },
      }),
    );
  },
  async update(id, data) {
    const { category, ...rest } = data;
    return mapFaq(
      await prisma.faq.update({
        where: { id },
        data: { ...rest, ...(category !== undefined ? { categoryId: category || null } : {}) },
      }),
    );
  },
  async find(id) {
    return mapFaq(await prisma.faq.findUnique({ where: { id } }));
  },
  async delete(id) {
    return mapFaq(await prisma.faq.delete({ where: { id } }));
  },
  async reorder(ids, scope) {
    const where = { ...faqWhere(scope), id: { in: ids } };
    const matched = await prisma.faq.count({ where });
    if (matched !== ids.length) return false;
    await prisma.$transaction(
      ids.map((id, order) => prisma.faq.update({ where: { id }, data: { order } })),
    );
    return true;
  },
  async suggestions(search) {
    return (
      await prisma.faq.findMany({
        where: { question: { contains: search } },
        select: { id: true, question: true },
        take: 5,
      })
    ).map(toLegacyEntity);
  },
};

const planInclude = { translations: true };
const comparisonInclude = { translations: true };
const pricingRepository = {
  async listPlans({ search, isActive, skip, take, locale }) {
    const where = { ...(search ? { translations: { some: { name: { contains: search } } } } : {}), ...(isActive !== undefined ? { isActive } : {}) };
    const [rows, total] = await Promise.all([
      prisma.pricingPlan.findMany({ where, include: planInclude, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }], skip, take }),
      prisma.pricingPlan.count({ where }),
    ]);
    return { rows: rows.map((row) => mapPlan(row, locale)), total };
  },
  async findPlan(id, locale) { return mapPlan(await prisma.pricingPlan.findUnique({ where: { id }, include: planInclude }), locale); },
  async savePlan(id, data) {
    const { translations, ...shared } = data;
    return prisma.$transaction(async (tx) => {
      const row = id
        ? await tx.pricingPlan.update({ where: { id }, data: shared })
        : await tx.pricingPlan.create({ data: { id: createEntityId(), ...shared } });
      if (translations) {
        for (const [locale, value] of Object.entries(translations)) await tx.pricingPlanTranslation.upsert({ where: { planId_locale: { planId: row.id, locale } }, create: { planId: row.id, locale, name: value.name, priceLabel: value.price || '', subtitle: value.subtitle || [], badge: value.badge || '', buttonText: value.buttonText || '', features: value.feature || [] }, update: { name: value.name, priceLabel: value.price || '', subtitle: value.subtitle || [], badge: value.badge || '', buttonText: value.buttonText || '', features: value.feature || [] } });
        if (!translations.en) await tx.pricingPlanTranslation.deleteMany({ where: { planId: row.id, locale: 'en' } });
      }
      return mapPlan(await tx.pricingPlan.findUnique({ where: { id: row.id }, include: planInclude }));
    });
  },
  async deletePlan(id) {
    return prisma.$transaction(async (tx) => {
      const row = await tx.pricingPlan.delete({ where: { id } });
      const translations = await tx.pricingComparisonTranslation.findMany();
      await Promise.all(translations.map((item) => { const values = parseComparisonValues(item.values); delete values[id]; return tx.pricingComparisonTranslation.update({ where: { id: item.id }, data: { values: JSON.stringify(values) } }); }));
      return mapPlan(row);
    });
  },
  async stats() { return Promise.all([prisma.pricingPlan.count(), prisma.pricingPlan.count({ where: { isActive: true } }), prisma.pricingPlanTranslation.findMany({ select: { features: true } }).then((rows) => rows.reduce((sum, row) => sum + (Array.isArray(row.features) ? row.features.length : 0), 0)), prisma.pricingComparison.count()]); },
  async listComparisons(locale) { return (await prisma.pricingComparison.findMany({ include: comparisonInclude, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })).map((row) => mapComparison(row, locale)); },
  async findComparison(id, locale) { return mapComparison(await prisma.pricingComparison.findUnique({ where: { id }, include: comparisonInclude }), locale); },
  async saveComparison(id, data) {
    const { translations, ...shared } = data;
    return prisma.$transaction(async (tx) => {
      const row = id ? await tx.pricingComparison.update({ where: { id }, data: shared }) : await tx.pricingComparison.create({ data: { id: createEntityId(), ...shared } });
      if (translations) {
        for (const [locale, value] of Object.entries(translations)) await tx.pricingComparisonTranslation.upsert({ where: { comparisonId_locale: { comparisonId: row.id, locale } }, create: { comparisonId: row.id, locale, title: value.title, values: serializeComparisonValues(value.values) }, update: { title: value.title, values: serializeComparisonValues(value.values) } });
        if (!translations.en) await tx.pricingComparisonTranslation.deleteMany({ where: { comparisonId: row.id, locale: 'en' } });
      }
      return mapComparison(await tx.pricingComparison.findUnique({ where: { id: row.id }, include: comparisonInclude }));
    });
  },
  async deleteComparison(id) { return mapComparison(await prisma.pricingComparison.delete({ where: { id } })); },
};

const settingsRepository = {
  async get() {
    let row = await prisma.settings.findFirst();
    if (!row) row = await prisma.settings.create({ data: { id: createEntityId() } });
    return mapSettings(row);
  },
  async updateAppearance(data) {
    const current = await this.get();
    const row = await prisma.settings.update({
      where: { id: current.id },
      data: {
        ...(data.themeMode ? { themeMode: data.themeMode } : {}),
        ...(data.accentColor ? { accentColor: data.accentColor } : {}),
      },
    });
    return mapSettings(row);
  },
  async updateSite(data) {
    const current = await this.get();
    const map = {
      name: 'siteName',
      slogan: 'slogan',
      logoUrl: 'logoUrl',
      faviconUrl: 'faviconUrl',
      hotline: 'hotline',
      email: 'email',
      address: 'address',
    };
    const update = {};
    Object.entries(map).forEach(([api, db]) => {
      if (data[api] !== undefined) update[db] = data[api];
    });
    if (data.socialLinks?.facebook !== undefined) update.facebookUrl = data.socialLinks.facebook;
    if (data.socialLinks?.zalo !== undefined) update.zaloUrl = data.socialLinks.zalo;
    return mapSettings(await prisma.settings.update({ where: { id: current.id }, data: update }));
  },
};

module.exports = { faqRepository, pricingRepository, settingsRepository };
