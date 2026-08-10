const Service = require('../../models/Service.model');
const { paginate, buildPaginationResponse, generateSlug } = require('../../helpers/format');
const { serviceSchema } = require('../../validators/admin/services.validator');

exports.getServices = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      Service.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      Service.countDocuments(filter),
    ]);

    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) {
    next(err);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const data = serviceSchema.parse(req.body);
    const slug = generateSlug(data.name);

    let service = await Service.findOne({ slug });
    if (service) return res.status(400).json({ success: false, error: { code: 'EXISTS', message: 'Dịch vụ này đã tồn tại' } });

    service = new Service({ ...data, slug });
    await service.save();

    res.status(201).json({ success: true, data: service });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const data = serviceSchema.parse(req.body);
    const slug = generateSlug(data.name);

    const service = await Service.findByIdAndUpdate(req.params.id, { ...data, slug }, { new: true });
    if (!service) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy dịch vụ' } });

    res.json({ success: true, data: service });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá dịch vụ' });
  } catch (err) {
    next(err);
  }
};
