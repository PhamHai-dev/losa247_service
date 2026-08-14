const Lead = require('../../models/Lead.model');
const XLSX = require('xlsx');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { sendEmail } = require('../../helpers/email');
const {
  createLeadSchema, updateLeadSchema, addNoteSchema,
  bulkUpdateLeadSchema, bulkDeleteLeadSchema, bulkEmailLeadSchema,
} = require('../../validators/admin/leads.validator');

const parseDateRange = (filter, fromDate, toDate) => {
  if (!fromDate && !toDate) return;
  filter.createdAt = {};
  if (fromDate) filter.createdAt.$gte = new Date(fromDate);
  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    filter.createdAt.$lte = end;
  }
};

const buildLeadFilter = ({ search, status, source, assignedTo, fromDate, toDate, ids }) => {
  const filter = {};
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (ids) filter._id = { $in: String(ids).split(',').filter(Boolean) };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  parseDateRange(filter, fromDate, toDate);
  return filter;
};

const validationError = (res, err) => res.status(400).json({
  success: false,
  error: { code: 'VALIDATION_ERROR', message: err.errors?.[0]?.message || err.message },
});
const hasPermission = (req, permission) => req.auth?.permissions?.includes('*') || req.auth?.permissions?.includes(permission);
const enforceLeadUpdatePermissions = (req, data, res) => {
  const fields = Object.keys(data || {});
  if (fields.includes('assignedTo') && !hasPermission(req, 'leads.assign')) {
    res.status(403).json({ success: false, error: { code: 'MISSING_PERMISSION', message: 'Thiếu quyền leads.assign' } });
    return false;
  }
  if (fields.some((field) => field !== 'assignedTo') && !hasPermission(req, 'leads.update')) {
    res.status(403).json({ success: false, error: { code: 'MISSING_PERMISSION', message: 'Thiếu quyền leads.update' } });
    return false;
  }
  return true;
};

exports.createLead = async (req, res, next) => {
  try {
    const validatedData = createLeadSchema.parse(req.body);
    const lead = new Lead(validatedData);
    await lead.save();
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    next(err);
  }
};

exports.getLeads = async (req, res, next) => {
  try {
    // 1. Lấy tham số phân trang và xây bộ lọc
    const { page, limit } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });
    const filter = buildLeadFilter(req.query);

    // 2. Query DB
    const [data, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email avatarUrl')
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(l),
      Lead.countDocuments(filter),
    ]);

    // 4. Trả response
    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) {
    next(err);
  }
};

exports.getLeadById = async (req, res, next) => {
  try {
    // 1. Tìm lead
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email avatarUrl')
      .populate('notes.createdBy', 'name');

    if (!lead) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lead' } });
    }

    // 2. Trả kết quả
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    const validatedData = updateLeadSchema.parse(req.body);
    if (!enforceLeadUpdatePermissions(req, validatedData, res)) return;

    // 2. Cập nhật lead
    const lead = await Lead.findByIdAndUpdate(req.params.id, validatedData, { new: true });
    if (!lead) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lead' } });
    }

    // 3. Trả kết quả
    res.json({ success: true, data: lead });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    next(err);
  }
};

exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lead' } });
    }
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

exports.addNote = async (req, res, next) => {
  try {
    // 1. Validate data
    const validatedData = addNoteSchema.parse(req.body);

    // 2. Tìm lead
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lead' } });
    }

    // 3. Thêm note
    lead.notes.push({
      content: validatedData.content,
      createdBy: req.user._id,
      createdAt: new Date(),
    });
    await lead.save();

    // 4. Trả kết quả
    res.json({ success: true, data: lead });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    next(err);
  }
};

exports.getLeadStats = async (req, res, next) => {
  try {
    const [grouped, total, todayCount, yesterdayCount] = await Promise.all([
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      (() => {
        const start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return Lead.countDocuments({ createdAt: { $gte: start, $lte: end } });
      })(),
    ]);
    const byStatus = grouped.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
    const percentChange = yesterdayCount === 0
      ? (todayCount > 0 ? 100 : 0)
      : ((todayCount - yesterdayCount) / yesterdayCount) * 100;
    res.json({ success: true, data: { total, byStatus, todayCount, yesterdayCount, percentChange } });
  } catch (err) { next(err); }
};

exports.bulkUpdateLeads = async (req, res, next) => {
  try {
    const { ids, data } = bulkUpdateLeadSchema.parse(req.body);
    if (!enforceLeadUpdatePermissions(req, data, res)) return;
    const result = await Lead.updateMany({ _id: { $in: ids } }, { $set: data });
    res.json({ success: true, data: { matched: result.matchedCount, updated: result.modifiedCount } });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    next(err);
  }
};

exports.bulkDeleteLeads = async (req, res, next) => {
  try {
    const { ids } = bulkDeleteLeadSchema.parse(req.body);
    const result = await Lead.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, data: { deleted: result.deletedCount } });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    next(err);
  }
};

exports.sendBulkEmail = async (req, res, next) => {
  try {
    const { ids, subject, content } = bulkEmailLeadSchema.parse(req.body);
    const leads = await Lead.find({ _id: { $in: ids }, email: { $exists: true, $nin: ['', null] } }).select('email');
    const results = await Promise.allSettled(leads.map((lead) => sendEmail({ to: lead.email, subject, html: content })));
    const sent = results.filter((item) => item.status === 'fulfilled').length;
    const failed = results.length - sent;
    res.json({ success: true, data: { selected: ids.length, eligible: leads.length, sent, failed } });
  } catch (err) {
    if (err.name === 'ZodError') return validationError(res, err);
    next(err);
  }
};

exports.exportLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find(buildLeadFilter(req.query))
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .lean();
    const statusLabels = { new: 'Mới', contacted: 'Đã liên hệ', qualified: 'Tiềm năng', converted: 'Đã chuyển đơn', lost: 'Thất bại' };
    const rows = leads.map((lead, index) => ({
      STT: index + 1,
      'Khách hàng': lead.name,
      'Số điện thoại': lead.phone,
      Email: lead.email || '',
      'Nguồn': lead.source || '',
      'Nhân viên': lead.assignedTo?.name || '',
      'Trạng thái': statusLabels[lead.status] || lead.status,
      'Ngày tạo': lead.createdAt ? new Date(lead.createdAt).toLocaleString('vi-VN') : '',
      'Cập nhật cuối': lead.updatedAt ? new Date(lead.updatedAt).toLocaleString('vi-VN') : '',
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet['!cols'] = [{ wch: 6 }, { wch: 24 }, { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 20 }, { wch: 20 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Leads');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.xlsx"`);
    res.send(buffer);
  } catch (err) { next(err); }
};
