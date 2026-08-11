const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User.model');
const Role = require('../models/Role.model');
const { normalizeRoleName } = require('../constants/permissions');

const authMiddleware = (type = 'client') => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Không tìm thấy token' } });
    }

    let decoded;
    try {
      const secret = type === 'admin' ? env.JWT_ADMIN_SECRET : env.JWT_CLIENT_SECRET;
      decoded = jwt.verify(authHeader.slice(7), secret);
    } catch {
      return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token không hợp lệ hoặc đã hết hạn' } });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Người dùng không tồn tại' } });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, error: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa' } });
    }

    const roleName = normalizeRoleName(user.role);
    let role = null;
    let permissions = [];
    if (type === 'admin') {
      if (!roleName || roleName === 'customer') {
        return res.status(403).json({ success: false, error: { code: 'ADMIN_ACCESS_DENIED', message: 'Không có quyền truy cập quản trị' } });
      }
      role = await Role.findOne({ name: roleName });
      if (!role) {
        return res.status(403).json({ success: false, error: { code: 'ROLE_NOT_FOUND', message: 'Vai trò quản trị không còn tồn tại' } });
      }
      permissions = roleName === 'admin' ? ['*'] : (Array.isArray(role.permissions) ? role.permissions : []);
    }

    user.role = roleName;
    user.permissions = permissions;
    req.user = user;
    req.auth = { user, role, permissions };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
