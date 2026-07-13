const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const env = require('../../config/env');
const { loginSchema, registerSchema } = require('../../validators/client/auth.validator');

exports.register = async (req, res, next) => {
  try {
    // 1. Validate dữ liệu đầu vào
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name, phone } = validatedData;

    // 2. Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email đã được sử dụng' } });
    }

    // 3. Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Tạo người dùng mới
    const user = new User({
      name,
      email,
      phone,
      passwordHash,
      role: 'customer',
    });
    await user.save();

    // 5. Trả kết quả
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    // 1. Validate dữ liệu
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // 2. Tìm user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng' } });
    }

    // 3. Kiểm tra trạng thái
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, error: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa' } });
    }

    // 4. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng' } });
    }

    // 5. Tạo token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_CLIENT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_CLIENT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Trả kết quả
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
