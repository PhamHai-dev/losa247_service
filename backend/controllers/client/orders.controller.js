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
