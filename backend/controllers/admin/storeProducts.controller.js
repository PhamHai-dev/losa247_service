const StoreProduct = require('../../models/StoreProduct.model');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { storeProductSchema } = require('../../validators/admin/storeProducts.validator');

exports.getStoreProducts = async (req, res, next) => {
  try {
    const { page, limit, search, platform, status } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = {};
    if (status) filter.status = status;
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

exports.createStoreProduct = async (req, res, next) => {
  try {
    const data = storeProductSchema.parse(req.body);

    if (data.n8nWorkflowJson) {
      if (typeof data.n8nWorkflowJson === 'string') {
        try {
          data.n8nWorkflowJson = JSON.parse(data.n8nWorkflowJson);
        } catch (e) {
          return res.status(400).json({ success: false, error: { code: 'INVALID_JSON', message: 'n8nWorkflowJson không phải là JSON hợp lệ' } });
        }
      }
    }

    const product = new StoreProduct(data);
    await product.save();

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    next(err);
  }
};

exports.updateStoreProduct = async (req, res, next) => {
  try {
    const data = storeProductSchema.parse(req.body);

    if (data.n8nWorkflowJson) {
      if (typeof data.n8nWorkflowJson === 'string') {
        try {
          data.n8nWorkflowJson = JSON.parse(data.n8nWorkflowJson);
        } catch (e) {
          return res.status(400).json({ success: false, error: { code: 'INVALID_JSON', message: 'n8nWorkflowJson không phải là JSON hợp lệ' } });
        }
      }
    }

    const product = await StoreProduct.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!product) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy sản phẩm' } });

    res.json({ success: true, data: product });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    next(err);
  }
};

exports.deleteStoreProduct = async (req, res, next) => {
  try {
    await StoreProduct.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá sản phẩm' });
  } catch (err) {
    next(err);
  }
};
