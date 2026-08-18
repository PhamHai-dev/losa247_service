const { prisma } = require('../../config/prisma');
const { toLegacyEntity } = require('../../repositories/core/legacyMapper');

exports.getKpis = async (_req, res, next) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [newLeads, completedLeads, totalBlogs, unhandledLeadsCount, openChatsCount] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.lead.count({ where: { status: 'converted' } }),
      prisma.blog.count({ where: { status: 'published' } }),
      prisma.lead.count({ where: { status: 'new' } }),
      prisma.chatSession.count({ where: { status: 'open' } }),
    ]);
    return res.json({
      success: true,
      data: { newLeads, completedLeads, totalBlogs, pendingTasks: unhandledLeadsCount + openChatsCount },
    });
  } catch (err) {
    return next(err);
  }
};

exports.getLeadsChart = async (req, res, next) => {
  try {
    const { range = '30d' } = req.query;
    const startDate = new Date();
    if (range === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (range === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
    else startDate.setDate(startDate.getDate() - 30);
    const leads = await prisma.lead.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    });
    const monthly = range === '1y';
    const counts = leads.reduce((result, lead) => {
      const date = lead.createdAt;
      const key = monthly
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      result[key] = (result[key] || 0) + 1;
      return result;
    }, {});
    const data = Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_id, leads]) => ({ _id, leads }));
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};

exports.getLeadStatus = async (_req, res, next) => {
  try {
    const groups = await prisma.lead.groupBy({ by: ['status'], _count: { _all: true } });
    return res.json({
      success: true,
      data: groups.map((item) => ({ _id: item.status, count: item._count._all })),
    });
  } catch (err) {
    return next(err);
  }
};

exports.getRecentLeads = async (_req, res, next) => {
  try {
    const rows = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, phone: true, status: true, createdAt: true },
    });
    return res.json({ success: true, data: rows.map(toLegacyEntity) });
  } catch (err) {
    return next(err);
  }
};

exports.getPopularContent = async (_req, res, next) => {
  try {
    const rows = await prisma.blog.findMany({
      where: { status: 'published' },
      orderBy: { views: 'desc' },
      take: 5,
      select: { id: true, title: true, views: true, slug: true, createdAt: true },
    });
    return res.json({ success: true, data: rows.map(toLegacyEntity) });
  } catch (err) {
    return next(err);
  }
};
