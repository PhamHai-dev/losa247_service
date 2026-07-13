const CartItem = require('../../models/CartItem.model');

exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const items = await CartItem.find({ userId })
      .populate('serviceId', 'name price images')
      .populate('storeProductId', 'name price workflowImageUrl');
      
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { serviceId, storeProductId, qty = 1 } = req.body;

    // Tìm xem đã có trong giỏ chưa
    let item = await CartItem.findOne({ userId, serviceId, storeProductId });
    if (item) {
      item.qty += qty;
    } else {
      item = new CartItem({ userId, serviceId, storeProductId, qty });
    }

    await item.save();

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { qty } = req.body;
    const item = await CartItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy mục trong giỏ hàng' } });
    }

    item.qty = qty;
    await item.save();

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    await CartItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá khỏi giỏ hàng' });
  } catch (err) {
    next(err);
  }
};
