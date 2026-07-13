const Lead = require('../../models/Lead.model');
const Order = require('../../models/Order.model');
const Service = require('../../models/Service.model');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { updateLeadSchema, addNoteSchema, convertToOrderSchema } = require('../../validators/admin/leads.validator');

exports.getLeads = async (req, res, next) => {
  try {
    // 1. Lấy tham số phân trang và tìm kiếm
    const { page, limit, search, status, source } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    // 2. Build filter
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // 3. Query DB
    const [data, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email')
        .populate('serviceInterested', 'name')
        .sort({ createdAt: -1 })
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
      .populate('assignedTo', 'name email')
      .populate('serviceInterested', 'name')
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
    // 1. Validate data
    const validatedData = updateLeadSchema.parse(req.body);

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

exports.convertToOrder = async (req, res, next) => {
  try {
    // 1. Validate data
    const validatedData = convertToOrderSchema.parse(req.body);

    // 2. Tìm lead
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lead' } });
    }

    if (lead.status === 'converted' && lead.convertedOrderId) {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_CONVERTED', message: 'Lead đã được chuyển thành đơn hàng' } });
    }

    // 3. Tìm service để lấy tên
    const service = await Service.findById(validatedData.serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: { code: 'SERVICE_NOT_FOUND', message: 'Không tìm thấy dịch vụ' } });
    }

    // 4. Tạo mã đơn hàng random (ví dụ: ORD-123456)
    const code = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    // 5. Tạo đơn hàng mới
    const order = new Order({
      code,
      customer: {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
      },
      items: [
        {
          serviceId: service._id,
          storeProductId: validatedData.storeProductId,
          name: service.name,
          price: validatedData.price,
          qty: validatedData.qty,
        }
      ],
      total: validatedData.price * validatedData.qty,
      status: 'pending',
    });
    await order.save();

    // 6. Cập nhật trạng thái lead
    lead.status = 'converted';
    lead.convertedOrderId = order._id;
    await lead.save();

    // 7. Trả kết quả
    res.json({ success: true, data: order });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    next(err);
  }
};

exports.exportLeads = async (req, res, next) => {
  try {
    // 1. Lấy toàn bộ lead (có thể thêm filter như GET /leads)
    const leads = await Lead.find({}).sort({ createdAt: -1 });

    // 2. Trong thực tế, dùng exceljs hoặc json2csv để convert sang file
    // Tạm thời trả về JSON data thẳng hoặc mock link export
    res.json({ success: true, data: leads, message: 'Tính năng export Excel đang được phát triển, đây là data thô.' });
  } catch (err) {
    next(err);
  }
};
