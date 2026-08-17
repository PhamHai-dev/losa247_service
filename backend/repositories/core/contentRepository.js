const { prisma } = require('../../config/prisma');
const { createEntityId } = require('./entityId');
const { toLegacyEntity } = require('./legacyMapper');

const mapFaq = (row) => row && toLegacyEntity({ ...row, category: row.categoryId });
const mapPlan = (row) => {
  if (!row) {
    return null;
  }

  const { priceAmount, priceLabel, features, ...plan } = row;

  return toLegacyEntity({
    ...plan,
    price: priceLabel || (priceAmount == null ? '' : String(priceAmount)),
    feature: (features || []).map((item) => item.content),
  });
};
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

const normalizePlanData = (data) => {
  const result = { ...data };
  if (result.price !== undefined) {
    result.priceLabel = String(result.price);
    const digits = String(result.price).replace(/\D/g, '');
    result.priceAmount = digits ? BigInt(digits) : null;
    delete result.price;
  }
  delete result.feature;
  return result;
};
const planInclude = { features: { orderBy: { sortOrder: 'asc' } } };
const pricingRepository = {
  async listPlans({ search, isActive, skip, take }) {
    const where = {
      ...(search ? { name: { contains: search } } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.pricingPlan.findMany({
        where,
        include: planInclude,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.pricingPlan.count({ where }),
    ]);
    return { rows: rows.map(mapPlan), total };
  },
  async findPlan(id) {
    return mapPlan(await prisma.pricingPlan.findUnique({ where: { id }, include: planInclude }));
  },
  async savePlan(id, data) {
    const features = data.feature;
    const scalar = normalizePlanData(data);
    return prisma.$transaction(async (tx) => {
      const row = id
        ? await tx.pricingPlan.update({ where: { id }, data: scalar })
        : await tx.pricingPlan.create({ data: { id: createEntityId(), subtitle: [], ...scalar } });
      if (features !== undefined) {
        await tx.pricingPlanFeature.deleteMany({ where: { planId: row.id } });
        if (features.length)
          await tx.pricingPlanFeature.createMany({
            data: features.map((content, sortOrder) => ({ planId: row.id, content, sortOrder })),
          });
      }
      return mapPlan(
        await tx.pricingPlan.findUnique({ where: { id: row.id }, include: planInclude }),
      );
    });
  },
  async deletePlan(id) {
    return prisma.$transaction(async (tx) => {
      const row = await tx.pricingPlan.delete({ where: { id } });
      const comparisons = await tx.pricingComparison.findMany();
      await Promise.all(
        comparisons.map(({ id: comparisonId, values }) => {
          const next = { ...(values || {}) };
          delete next[id];
          return tx.pricingComparison.update({
            where: { id: comparisonId },
            data: { values: next },
          });
        }),
      );
      return mapPlan(row);
    });
  },
  async stats() {
    return Promise.all([
      prisma.pricingPlan.count(),
      prisma.pricingPlan.count({ where: { isActive: true } }),
      prisma.pricingPlanFeature.count(),
      prisma.pricingComparison.count(),
    ]);
  },
  async listComparisons() {
    return (
      await prisma.pricingComparison.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })
    ).map(toLegacyEntity);
  },
  async findComparison(id) {
    return toLegacyEntity(await prisma.pricingComparison.findUnique({ where: { id } }));
  },
  async saveComparison(id, data) {
    return toLegacyEntity(
      id
        ? await prisma.pricingComparison.update({ where: { id }, data })
        : await prisma.pricingComparison.create({
            data: { id: createEntityId(), values: {}, ...data },
          }),
    );
  },
  async deleteComparison(id) {
    return toLegacyEntity(await prisma.pricingComparison.delete({ where: { id } }));
  },
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
