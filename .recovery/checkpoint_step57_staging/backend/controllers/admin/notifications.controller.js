const Notification = require('../../models/Notification.model');

// Lấy danh sách thông báo
exports.getNotifications = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments();
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      total,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

// Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (id === 'all') {
      await Notification.updateMany({ isRead: false }, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }

    res.status(200).json({ success: true, message: 'Updated successfully' });
  } catch (err) {
    next(err);
  }
};
