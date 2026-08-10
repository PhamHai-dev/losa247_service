const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User.model');
const Role = require('../models/Role.model');
const { normalizeRoleName } = require('../constants/permissions');

const authMiddleware = (type = 'client') => {
  return async (req, res, next) => {
    try {
      // 1. Lấy token từ header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Không tìm thấy token' } });
      }

      const token = authHeader.split(' ')[1];
      
      // 2. Chọn secret dựa vào type (admin/client)
      const secret = type === 'admin' ? env.JWT_ADMIN_SECRET : env.JWT_CLIENT_SECRET;

      // 3. Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, secret);
      } catch (err) {
        return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token không hợp lệ hoặc đã hết hạn' } });
      }

      // 4. Lấy thông tin user từ DB
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Người dùng không tồn tại' } });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, error: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa' } });
      }

      // 5. Kiểm tra role và nạp permissions hiện tại đối với admin
      if (type === 'admin') {
        const roleName = normalizeRoleName(user.role);
        if (roleName === 'customer') {
          return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền truy cập quản trị' } });
        }

        const role = roleName === 'admin' ? { name: 'admin', permissions: ['*'], isSystem: true } : await Role.findOne({ name: roleName }).lean();
        if (!role) {
          return res.status(403).json({ success: false, error: { code: 'ROLE_NOT_FOUND', message: 'Vai trò quản trị không tồn tại' } });
        }

        req.auth = {
          user,
          role,
          permissions: roleName === 'admin' ? ['*'] : (role.permissions || []),
        };
        user.permissions = req.auth.permissions;
      }

      // 6. Gắn user vào request
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authMiddleware;
