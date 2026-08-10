const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const env = require('../../config/env');
const crypto = require('crypto');
const { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } = require('../../validators/client/auth.validator');
const emailHelper = require('../../helpers/email');

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

    // Lưu refreshToken vào DB
    user.refreshTokens.push(refreshToken);
    await user.save();

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

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: { code: 'NO_TOKEN', message: 'Thiếu refresh token' } });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_CLIENT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token không hợp lệ hoặc đã hết hạn' } });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token đã bị thu hồi hoặc không hợp lệ' } });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_CLIENT_SECRET,
      { expiresIn: '15m' }
    );

    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    
    const newRefreshToken = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_CLIENT_SECRET,
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
        decoded = jwt.verify(refreshToken, env.JWT_CLIENT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
          await user.save();
        }
      } catch (err) {}
    }
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email });
    
    if (!user) {
      // Return success even if not found to prevent email enumeration
      return res.json({ success: true, data: null, message: 'Nếu email tồn tại, link khôi phục đã được gửi' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      await emailHelper.sendResetPasswordEmail(user.email, resetToken);
      res.json({ success: true, data: null, message: 'Đã gửi email khôi phục' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ success: false, error: { code: 'EMAIL_FAILED', message: 'Không thể gửi email' } });
    }
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token không hợp lệ hoặc đã hết hạn' } });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // Xoá tất cả refreshTokens để bắt buộc đăng nhập lại mọi nơi
    user.refreshTokens = [];
    await user.save();

    res.json({ success: true, data: null, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    next(err);
  }
};
