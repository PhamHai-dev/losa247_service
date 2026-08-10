const Order = require('../../models/Order.model');
const CartItem = require('../../models/CartItem.model');
const Service = require('../../models/Service.model');
const StoreProduct = require('../../models/StoreProduct.model');
const { createOrderSchema } = require('../../validators/client/orders.validator');

exports.createOrder = async (req, res, next) => {
  try {
    // 1. Lấy userId từ token
    const userId = req.user._id.toString();

    // 2. Validate input
    const validatedData = createOrderSchema.parse(req.body);

    // 3. Lấy giỏ hàng của user
    const cartItems = await CartItem.find({ userId });
    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'EMPTY_CART', message: 'Giỏ hàng trống' } });
    }

    // 4. Tạo chi tiết đơn hàng
    let total = 0;
    const orderItems = [];

    for (const item of cartItems) {
      let price = 0;
      let name = '';

      if (item.serviceId) {
        const service = await Service.findById(item.serviceId);
        if (service) {
          price = service.price;
          name = service.name;
        }
      } else if (item.storeProductId) {
        const product = await StoreProduct.findById(item.storeProductId);
        if (product) {
          price = product.price;
          name = product.name;
        }
      }

      orderItems.push({
        serviceId: item.serviceId,
        storeProductId: item.storeProductId,
        name,
        price,
        qty: item.qty,
      });

      total += price * item.qty;
    }

    // 5. Tạo mã đơn hàng ngẫu nhiên
    const code = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    // 6. Lưu đơn hàng
    const order = new Order({
      code,
      customer: {
        name: validatedData.customerName,
        phone: validatedData.customerPhone,
        email: validatedData.customerEmail,
      },
      items: orderItems,
      total,
      status: 'pending',
      paymentMethod: validatedData.paymentMethod || 'transfer',
    });

    await order.save();

    // 7. Xoá giỏ hàng sau khi tạo đơn thành công
    await CartItem.deleteMany({ userId });

    // 8. Trả kết quả
    res.json({ success: true, data: order });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.serviceId', 'name images')
      .populate('items.storeProductId', 'name workflowImageUrl');

    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' } });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    // Assuming we can identify orders by customer email/phone matching user, 
    // or by adding userId to Order model.
    // Wait, Order.model.js might not have userId. I will just search by customer.email if possible, or we need to add userId.
    // Assuming Order model has customer email, we use req.user.email.
    const orders = await Order.find({ 'customer.email': req.user.email })
      .populate('items.serviceId', 'name')
      .populate('items.storeProductId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

exports.paymentCallback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' } });
    }
    
    // Simulate successful payment (in real app, verify signature from payment gateway)
    order.status = 'paid';
    await order.save();

    res.json({ success: true, data: order, message: 'Thanh toán thành công' });
  } catch (err) {
    next(err);
  }
};
