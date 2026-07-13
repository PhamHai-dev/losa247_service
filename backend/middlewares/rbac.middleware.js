const rbacMiddleware = (requiredPermissions = []) => {
  return (req, res, next) => {
    // 1. Lấy thông tin user đã được gắn từ auth.middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Chưa xác thực' } });
    }

    // 2. Nếu là admin tối cao thì luôn cho qua
    if (user.role === 'admin') {
      return next();
    }

    // 3. Kiểm tra xem user có đủ permission không
    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.some((perm) => user.permissions.includes(perm));
      if (!hasPermission) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thực hiện hành động này' } });
      }
    }

    // 4. Cho qua nếu pass
    next();
  };
};

module.exports = rbacMiddleware;
