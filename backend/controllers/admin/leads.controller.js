const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { toLegacyEntity, toLegacyUser } = require('../../repositories/core/legacyMapper');
const XLSX = require('xlsx');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { sendEmail } = require('../../helpers/email');
const {
  createLeadSchema,
  updateLeadSchema,
  addNoteSchema,
  bulkUpdateLeadSchema,
  bulkDeleteLeadSchema,
  bulkEmailLeadSchema,
} = require('../../validators/admin/leads.validator');

const dateRange = (fromDate, toDate) => {
  if (!fromDate && !toDate) return undefined;
  const range = {};
  if (fromDate) range.gte = new Date(fromDate);
  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    range.lte = end;
  }
  return range;
};
const buildLeadWhere = ({ search, status, source, assignedTo, fromDate, toDate, ids }) => ({
  ...(status ? { status } : {}),
  ...(source ? { source } : {}),
  ...(assignedTo ? { assignedToId: assignedTo } : {}),
  ...(ids ? { id: { in: String(ids).split(',').filter(Boolean) } } : {}),
  ...(search
    ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {}),
  ...(dateRange(fromDate, toDate) ? { createdAt: dateRange(fromDate, toDate) } : {}),
});
const leadInclude = {
  assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
};
const mapLead = ({ assignedTo, ...lead }) => ({
  ...toLegacyEntity(lead),
  assignedTo: assignedTo ? toLegacyUser(assignedTo) : null,
});
const normalizeLeadData = (data) => {
  const result = { ...data };
  if (result.assignedTo !== undefined) {
    result.assignedToId = result.assignedTo || null;
    delete result.assignedTo;
  }
  return result;
};
const validationError = (res, err) =>
  res
    .status(400)
    .json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.errors?.[0]?.message || err.message },
    });
const notFound = (res) =>
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lead' } });
const hasPermission = (req, permission) =>
  req.auth?.permissions?.includes('*') || req.auth?.permissions?.includes(permission);
const enforceLeadUpdatePermissions = (req, data, res) => {
  const fields = Object.keys(data || {});
  if (fields.includes('assignedTo') && !hasPermission(req, 'leads.assign')) {
    res
      .status(403)
      .json({
        success: false,
        error: { code: 'MISSING_PERMISSION', message: 'Thiếu quyền leads.assign' },
      });
    return false;
  }
  if (fields.some((field) => field !== 'assignedTo') && !hasPermission(req, 'leads.update')) {
    res
      .status(403)
      .json({
        success: false,
        error: { code: 'MISSING_PERMISSION', message: 'Thiếu quyền leads.update' },
      });
    return false;
  }
  return true;
};

exports.createLead = async (req, res, next) => {
  try {
    const data = normalizeLeadData(createLeadSchema.parse(req.body));
    const lead = await prisma.lead.create({
      data: { id: createEntityId(), notes: [], ...data },
      include: leadInclude,
    });
    return res.status(201).json({ success: true, data: mapLead(lead) });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    return next(err);
  }
};
exports.getLeads = async (req, res, next) => {
  try {
    const { skip, limit, page } = paginate(req.query, req.query);
    const where = buildLeadWhere(req.query);
    const [rows, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: leadInclude,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);
    return res.json(buildPaginationResponse(rows.map(mapLead), total, page, limit));
  } catch (err) {
    return next(err);
  }
};
exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: leadInclude,
    });
    if (!lead) return notFound(res);
    const mapped = mapLead(lead);
    if (Array.isArray(mapped.notes)) {
      const ids = [...new Set(mapped.notes.map((note) => note.createdBy).filter(Boolean))];
      const users = await prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true },
      });
      const byId = new Map(users.map((user) => [user.id, toLegacyUser(user)]));
      mapped.notes = mapped.notes.map((note) => ({
        ...note,
        createdBy: byId.get(String(note.createdBy)) || note.createdBy,
      }));
    }
    return res.json({ success: true, data: mapped });
  } catch (err) {
    return next(err);
  }
};
exports.updateLead = async (req, res, next) => {
  try {
    const validated = updateLeadSchema.parse(req.body);
    if (!enforceLeadUpdatePermissions(req, validated, res)) return;
    const exists = await prisma.lead.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!exists) return notFound(res);
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: normalizeLeadData(validated),
      include: leadInclude,
    });
    return res.json({ success: true, data: mapLead(lead) });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    return next(err);
  }
};
exports.deleteLead = async (req, res, next) => {
  try {
    const exists = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!exists) return notFound(res);
    await prisma.lead.delete({ where: { id: req.params.id } });
    return res.json({ success: true, data: toLegacyEntity(exists) });
  } catch (err) {
    return next(err);
  }
};
exports.addNote = async (req, res, next) => {
  try {
    const { content } = addNoteSchema.parse(req.body);
    const current = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!current) return notFound(res);
    const notes = Array.isArray(current.notes) ? current.notes : [];
    const lead = await prisma.lead.update({
      where: { id: current.id },
      data: {
        notes: [
          ...notes,
          { content, createdBy: req.user._id, createdAt: new Date().toISOString() },
        ],
      },
      include: leadInclude,
    });
    return res.json({ success: true, data: mapLead(lead) });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    return next(err);
  }
};
exports.getLeadStats = async (_req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(today.getTime() - 1);
    const [grouped, total, todayCount, yesterdayCount] = await Promise.all([
      prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: today } } }),
      prisma.lead.count({ where: { createdAt: { gte: yesterday, lte: yesterdayEnd } } }),
    ]);
    const byStatus = Object.fromEntries(grouped.map((item) => [item.status, item._count._all]));
    const percentChange =
      yesterdayCount === 0
        ? todayCount > 0
          ? 100
          : 0
        : ((todayCount - yesterdayCount) / yesterdayCount) * 100;
    return res.json({
      success: true,
      data: { total, byStatus, todayCount, yesterdayCount, percentChange },
    });
  } catch (err) {
    return next(err);
  }
};
exports.bulkUpdateLeads = async (req, res, next) => {
  try {
    const { ids, data } = bulkUpdateLeadSchema.parse(req.body);
    if (!enforceLeadUpdatePermissions(req, data, res)) return;
    const result = await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: normalizeLeadData(data),
    });
    return res.json({ success: true, data: { matched: result.count, updated: result.count } });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    return next(err);
  }
};
exports.bulkDeleteLeads = async (req, res, next) => {
  try {
    const { ids } = bulkDeleteLeadSchema.parse(req.body);
    const result = await prisma.lead.deleteMany({ where: { id: { in: ids } } });
    return res.json({ success: true, data: { deleted: result.count } });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    return next(err);
  }
};
exports.sendBulkEmail = async (req, res, next) => {
  try {
    const { ids, subject, content } = bulkEmailLeadSchema.parse(req.body);
    const leads = await prisma.lead.findMany({
      where: { id: { in: ids }, email: { not: null } },
      select: { email: true },
    });
    const eligible = leads.filter(({ email }) => email);
    const results = await Promise.allSettled(
      eligible.map((lead) => sendEmail({ to: lead.email, subject, html: content })),
    );
    const sent = results.filter((item) => item.status === 'fulfilled').length;
    return res.json({
      success: true,
      data: {
        selected: ids.length,
        eligible: eligible.length,
        sent,
        failed: results.length - sent,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    return next(err);
  }
};
exports.exportLeads = async (req, res, next) => {
  try {
    const rows = (
      await prisma.lead.findMany({
        where: buildLeadWhere(req.query),
        include: leadInclude,
        orderBy: { createdAt: 'desc' },
      })
    ).map(mapLead);
    const settings = await prisma.settings.findFirst({ select: { leadFormConfig: true } });
    const configuredFields = settings?.leadFormConfig?.fields || [];
    const labels = new Map(configuredFields.map((field) => [field.key, field.label]));
    const dynamicKeys = [...new Set(rows.flatMap((lead) => Object.keys(lead.customFields?.values || {})))].filter((key) => !['name', 'phone', 'email'].includes(key));
    const statusLabels = {
      new: 'Mới',
      contacted: 'Đã liên hệ',
      qualified: 'Tiềm năng',
      converted: 'Đã chuyển đơn',
      lost: 'Thất bại',
    };
    const data = rows.map((lead, index) => ({
      STT: index + 1,
      'Khách hàng': lead.name || '',
      'Số điện thoại': lead.phone || '',
      Email: lead.email || '',
      Nguồn: lead.source || '',
      'Nhân viên': lead.assignedTo?.name || '',
      'Trạng thái': statusLabels[lead.status] || lead.status,
      ...Object.fromEntries(dynamicKeys.map((key) => [labels.get(key) || key, lead.customFields?.values?.[key] ?? ''])),
      'Ngày tạo': lead.createdAt ? new Date(lead.createdAt).toLocaleString('vi-VN') : '',
      'Cập nhật cuối': lead.updatedAt ? new Date(lead.updatedAt).toLocaleString('vi-VN') : '',
    }));
    const sheet = XLSX.utils.json_to_sheet(data);
    sheet['!cols'] = [
      { wch: 6 },
      { wch: 24 },
      { wch: 16 },
      { wch: 28 },
      { wch: 14 },
      { wch: 22 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Leads');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.xlsx"`);
    return res.send(buffer);
  } catch (err) {
    return next(err);
  }
};
