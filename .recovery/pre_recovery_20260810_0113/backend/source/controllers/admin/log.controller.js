const Log = require('../../models/Log.model');
const { buildPaginationResponse } = require('../../helpers/format');

exports.getLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { module, action, dateFrom, dateTo } = req.query;

    const query = {};
    if (module) query.module = module;
    if (action) query.action = action;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const logs = await Log.find(query)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Log.countDocuments(query);

    res.json(buildPaginationResponse(logs, page, limit, total));
  } catch (err) {
    next(err);
  }
};

exports.exportLogs = async (req, res, next) => {
  try {
    const { module, action, dateFrom, dateTo } = req.query;

    const query = {};
    if (module) query.module = module;
    if (action) query.action = action;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const logs = await Log.find(query)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    // Sinh CSV
    const headers = ['ID', 'Thời gian', 'Người dùng', 'Hành động', 'Module', 'IP'];
    const rows = logs.map(log => {
      const time = log.createdAt.toISOString();
      const actorName = log.actor ? log.actor.name : 'Unknown';
      return [
        log._id,
        time,
        `"${actorName}"`,
        `"${log.action}"`,
        `"${log.module}"`,
        log.ip || '',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="system_logs.csv"');
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
};
