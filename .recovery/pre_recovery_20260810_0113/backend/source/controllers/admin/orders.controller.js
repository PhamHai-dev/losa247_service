const Order = require('../../models/Order.model');
const CartItem = require('../../models/CartItem.model');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { updateStatusSchema, cancelOrderSchema } = require('../../validators/admin/orders.validator');
const n8nHelper = require('../../helpers/n8n');

exports.getOrders = async (req, res, next) => {
  try {
    // 1. Phân trang
    const { page, limit, search, status } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    // 2. Bộ lọc
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    // 3. Query
    const [data, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      Order.countDocuments(filter),
    ]);

    // 4. Trả kết quả
    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.serviceId', 'name')
      .populate('items.storeProductId', 'name');
      
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' } });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    // 1. Validate body
    const { status } = updateStatusSchema.parse(req.body);

    // 2. Tìm đơn
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' } });
    }

    // 3. Cập nhật
    order.status = status;
    await order.save();

    // 4. Trả kết quả
    res.json({ success: true, data: order });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    next(err);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' } });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Trạng thái đơn hàng không hợp lệ để xác nhận thanh toán' } });
    }

    order.status = 'paid';
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.activateOrder = async (req, res, next) => {
  try {
    // 1. Lấy đơn hàng theo id
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' } });
    }

    // 2. Kiểm tra trạng thái hợp lệ trước khi kích hoạt
    if (order.status !== 'paid') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Đơn hàng chưa thanh toán' } });
    }

    // 3. Cập nhật trạng thái đơn hàng
    order.status = 'active';
    order.activatedAt = new Date();
    await order.save();

    // 4. Gọi n8n để kích hoạt dịch vụ thật
    try {
      await n8nHelper.triggerActivation(order);
    } catch (n8nError) {
      console.error(n8nError);
      return res.json({ success: true, warning: 'Đã kích hoạt trên hệ thống, nhưng lỗi khi gọi n8n', data: order });
    }

    // 5. Trả kết quả
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = cancelOrderSchema.parse(req.body);

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' } });
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Không thể huỷ đơn hàng này' } });
    }

    order.status = 'cancelled';
    order.cancelReason = reason;
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    next(err);
  }
};

exports.getAbandonedCarts = async (req, res, next) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { page, limit } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = { addedAt: { $lte: oneDayAgo } };

    const [data, total] = await Promise.all([
      CartItem.find(filter).sort({ addedAt: 1 }).skip(skip).limit(l),
      CartItem.countDocuments(filter),
    ]);

    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) {
    next(err);
  }
};

exports.remindAbandonedCart = async (req, res, next) => {
  try {
    const cartItem = await CartItem.findById(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy giỏ hàng' } });
    }

    try {
      await n8nHelper.sendCartReminder(cartItem);
    } catch (n8nError) {
      return res.status(500).json({ success: false, error: { code: 'N8N_ERROR', message: 'Lỗi khi gọi n8n' } });
    }

    cartItem.remindedAt = new Date();
    await cartItem.save();

    res.json({ success: true, message: 'Đã gửi nhắc nhở thành công' });
  } catch (err) {
    next(err);
  }
};
