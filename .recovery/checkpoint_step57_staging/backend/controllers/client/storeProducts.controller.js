const StoreProduct = require('../../models/StoreProduct.model');
const { paginate, buildPaginationResponse } = require('../../helpers/format');

exports.getStoreProducts = async (req, res, next) => {
  try {
    const { page, limit, search, platform } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = { status: 'visible' };
    if (platform) filter.platform = platform;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      StoreProduct.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      StoreProduct.countDocuments(filter),
    ]);

    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) {
    next(err);
  }
};

exports.getStoreProductById = async (req, res, next) => {
  try {
    const product = await StoreProduct.findOne({ _id: req.params.id, status: 'visible' });
    if (!product) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sản phẩm' } });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};
