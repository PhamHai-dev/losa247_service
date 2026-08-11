const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const Role = require('../../models/Role.model');
const env = require('../../config/env');
const { loginSchema } = require('../../validators/admin/auth.validator');
const { normalizeRoleName } = require('../../constants/permissions');

const findAdminRole = async (user) => {
  const roleName = normalizeRoleName(user?.role);
  if (!roleName || roleName === 'customer' || user?.status !== 'active') return null;
  return Role.findOne({ name: roleName });
};

const serializeAdmin = (user, role) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: normalizeRoleName(user.role),
  status: user.status,
  avatarUrl: user.avatarUrl,
  permissions: role.name === 'admin' ? ['*'] : (role.permissions || []),
});

const signTokens = (user) => ({
  accessToken: jwt.sign({ id: user._id, role: user.role }, env.JWT_ADMIN_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id: user._id, role: user.role }, env.JWT_ADMIN_SECRET, { expiresIn: '7d' }),
});

exports.login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng' } });
    }

    const role = await findAdminRole(user);
    if (!role) {
      const code = user.status !== 'active' ? 'ACCOUNT_LOCKED' : 'ADMIN_ACCESS_DENIED';
      return res.status(403).json({ success: false, error: { code, message: user.status !== 'active' ? 'Tài khoản đã bị khóa' : 'Vai trò không có quyền truy cập quản trị' } });
    }

    const tokens = signTokens(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    return res.json({ success: true, data: { ...tokens, user: serializeAdmin(user, role) } });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors?.[0]?.message || 'Dữ liệu không hợp lệ' } });
    }
    return next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const role = req.auth?.role || await findAdminRole(req.user);
    if (!role) return res.status(403).json({ success: false, error: { code: 'ROLE_NOT_FOUND', message: 'Vai trò quản trị không còn tồn tại' } });
    return res.json({ success: true, data: serializeAdmin(req.user, role) });
  } catch (err) {
    return next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, error: { code: 'NO_TOKEN', message: 'Thiếu refresh token' } });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_ADMIN_SECRET);
    } catch {
      return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token không hợp lệ hoặc đã hết hạn' } });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token đã bị thu hồi hoặc không hợp lệ' } });
    }
    const role = await findAdminRole(user);
    if (!role) {
      user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
      await user.save();
      return res.status(403).json({ success: false, error: { code: user.status !== 'active' ? 'ACCOUNT_LOCKED' : 'ROLE_NOT_FOUND', message: 'Phiên quản trị không còn hợp lệ' } });
    }

    const tokens = signTokens(user);
    user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    return res.json({ success: true, data: { ...tokens, user: serializeAdmin(user, role) } });
  } catch (err) {
    return next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, env.JWT_ADMIN_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
          await user.save();
        }
      } catch {
        // Logout is best-effort for expired or invalid tokens.
      }
    }
    return res.json({ success: true, data: null });
  } catch (err) {
    return next(err);
  }
};
