const { prisma } = require('../../config/prisma');
const { buildPaginationResponse } = require('../../helpers/format');
const { toLegacyEntity, toLegacyUser } = require('../../repositories/core/legacyMapper');

const buildWhere = ({ module, action, dateFrom, dateTo }) => ({
  ...(module ? { module } : {}),
  ...(action ? { action } : {}),
  ...(dateFrom || dateTo
    ? {
        createdAt: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {}),
        },
      }
    : {}),
});
const mapLog = ({ actor, ...log }) => ({
  ...toLegacyEntity(log),
  actor: actor ? toLegacyUser(actor) : null,
});

exports.getLogs = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const where = buildWhere(req.query);
    const [rows, total] = await Promise.all([
      prisma.log.findMany({
        where,
        include: { actor: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.log.count({ where }),
    ]);
    return res.json(buildPaginationResponse(rows.map(mapLog), total, page, limit));
  } catch (err) {
    return next(err);
  }
};

exports.exportLogs = async (req, res, next) => {
  try {
    const logs = (
      await prisma.log.findMany({
        where: buildWhere(req.query),
        include: { actor: true },
        orderBy: { createdAt: 'desc' },
      })
    ).map(mapLog);
    const headers = ['ID', 'Thời gian', 'Người dùng', 'Hành động', 'Module', 'IP'];
    const rows = logs.map((log) =>
      [
        log._id,
        log.createdAt.toISOString(),
        `"${log.actor?.name || 'Unknown'}"`,
        `"${log.action}"`,
        `"${log.module}"`,
        log.ip || '',
      ].join(','),
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="system_logs.csv"');
    return res.send(csvContent);
  } catch (err) {
    return next(err);
  }
};
