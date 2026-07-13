const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const env = require('../../config/env');
const { loginSchema } = require('../../validators/admin/auth.validator');

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

    // 3. Kiểm tra quyền admin
    if (!['admin', 'sales', 'editor'].includes(user.role)) {
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
          permissions: user.permissions,
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
    // 1. Trả về thông tin user đã được gắn ở auth.middleware
    res.json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    next(err);
  }
};
