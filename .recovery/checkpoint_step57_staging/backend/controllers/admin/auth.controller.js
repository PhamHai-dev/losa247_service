const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const Role = require('../../models/Role.model');
const env = require('../../config/env');
const { loginSchema } = require('../../validators/admin/auth.validator');
const { normalizeRoleName } = require('../../constants/permissions');

exports.login = async (req, res, next) => {
  try {
    // 1. Validate dữ liệu đầu vào
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // 2. Tìm người dùng
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng' } });
    }

    // 3. Kiểm tra role quản trị từ collection roles
    const roleName = normalizeRoleName(user.role);
    const roleDoc = roleName === 'admin' ? { name: 'admin', permissions: ['*'], isSystem: true } : await Role.findOne({ name: roleName });
    if (roleName === 'customer' || !roleDoc) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền truy cập quản trị' } });
    }

    // 4. Kiểm tra trạng thái tài khoản
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, error: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa' } });
    }

    // 5. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng' } });
    }

    // 6. Tạo token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_ADMIN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_ADMIN_SECRET,
      { expiresIn: '7d' }
    );

    // Lưu refreshToken vào DB
    user.refreshTokens.push(refreshToken);
    await user.save();

    const permissions = roleName === 'admin' ? ['*'] : (roleDoc.permissions || []);

    // 7. Trả kết quả
    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions,
        },
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const userObj = req.user.toObject();
    userObj.permissions = req.auth?.permissions || [];
    delete userObj.passwordHash;

    // 1. Trả về thông tin user đã được gắn ở auth.middleware
    res.json({
      success: true,
      data: userObj,
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: { code: 'NO_TOKEN', message: 'Thiếu refresh token' } });
    }

    // Xác thực token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_ADMIN_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token không hợp lệ hoặc đã hết hạn' } });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token đã bị thu hồi hoặc không hợp lệ' } });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, error: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa' } });
    }
    const roleName = normalizeRoleName(user.role);
    const roleDoc = await Role.findOne({ name: roleName });
    if (roleName === 'customer' || !roleDoc) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền truy cập quản trị' } });
    }

    // Tạo token mới
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_ADMIN_SECRET,
      { expiresIn: '15m' }
    );

    // Xoá token cũ, tạo token mới
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    
    const newRefreshToken = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_ADMIN_SECRET,
      { expiresIn: '7d' }
    );
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, env.JWT_ADMIN_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
          await user.save();
        }
      } catch (err) {
        // Bỏ qua lỗi verify khi logout
      }
    }
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
