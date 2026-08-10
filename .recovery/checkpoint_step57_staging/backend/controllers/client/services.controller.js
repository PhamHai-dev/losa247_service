const Service = require('../../models/Service.model');
const { paginate, buildPaginationResponse } = require('../../helpers/format');

exports.getServices = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = { status: 'visible' };
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      Service.find(filter).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(l),
      Service.countDocuments(filter),
    ]);

    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) {
    next(err);
  }
};

exports.getServiceBySlug = async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, status: 'visible' });
    if (!service) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy dịch vụ' } });
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};
