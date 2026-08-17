const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { userRepository, sessionRepository } = require('../../repositories/core/identityRepository');
const {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../../validators/client/auth.validator');
const emailHelper = require('../../helpers/email');
const token = require('../../helpers/token');
const AUDIENCE = 'client';
const sessionOf = (refresh, req) => ({
  tokenHash: token.hashToken(refresh.token),
  jti: refresh.jti,
  familyId: refresh.familyId,
  audience: AUDIENCE,
  expiresAt: refresh.expiresAt,
  userAgent: String(req.get('user-agent') || '').slice(0, 300),
  ip: req.ip,
});

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, phone } = registerSchema.parse(req.body);
    if (await userRepository.existsEmail(email))
      return res
        .status(400)
        .json({
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email đã được sử dụng' },
        });
    const user = await userRepository.create({
      name,
      email,
      phone,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'customer',
    });
    return res.status(201).json({ success: true, data: token.serializeUser(user) });
  } catch (e) {
    if (e.name === 'ZodError')
      return res
        .status(400)
        .json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: e.errors[0].message },
        });
    return next(e);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await userRepository.findByEmail(email, true);
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res
        .status(401)
        .json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng' },
        });
    if (user.status !== 'active')
      return res
        .status(403)
        .json({
          success: false,
          error: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa' },
        });
    const refresh = token.createRefreshToken(user, AUDIENCE);
    await sessionRepository.replaceForLogin(user._id, sessionOf(refresh, req));
    token.setRefreshCookie(res, AUDIENCE, refresh.token);
    return res.json({
      success: true,
      data: { accessToken: token.signAccessToken(user, AUDIENCE), user: token.serializeUser(user) },
    });
  } catch (e) {
    if (e.name === 'ZodError')
      return res
        .status(400)
        .json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: e.errors[0].message },
        });
    return next(e);
  }
};
exports.getMe = (req, res) => res.json({ success: true, data: token.serializeUser(req.user) });
exports.refresh = async (req, res, next) => {
  try {
    const raw = token.readRefreshCookie(req, AUDIENCE);
    if (!raw)
      return res
        .status(401)
        .json({ success: false, error: { code: 'NO_TOKEN', message: 'Thiếu refresh token' } });
    let decoded;
    try {
      decoded = token.verifyToken(raw, AUDIENCE, 'refresh');
    } catch {
      return res
        .status(401)
        .json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Phiên không hợp lệ hoặc đã hết hạn' },
        });
    }
    const hash = token.hashToken(raw);
    const user = await userRepository.findById(decoded.id, true);
    const session = user ? await sessionRepository.findValid(user._id, hash, AUDIENCE) : null;
    if (!session) {
      if (user && decoded.familyId)
        await sessionRepository.revokeFamily(user._id, decoded.familyId);
      token.clearRefreshCookie(res, AUDIENCE);
      return res
        .status(401)
        .json({ success: false, error: { code: 'TOKEN_REUSE', message: 'Phiên đã bị thu hồi' } });
    }
    if (user.status !== 'active') {
      await sessionRepository.revokeById(session.id);
      token.clearRefreshCookie(res, AUDIENCE);
      return res
        .status(403)
        .json({
          success: false,
          error: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa' },
        });
    }
    const fresh = token.createRefreshToken(user, AUDIENCE, decoded.familyId);
    await sessionRepository.rotate(session.id, sessionOf(fresh, req));
    token.setRefreshCookie(res, AUDIENCE, fresh.token);
    return res.json({
      success: true,
      data: { accessToken: token.signAccessToken(user, AUDIENCE), user: token.serializeUser(user) },
    });
  } catch (e) {
    return next(e);
  }
};
exports.logout = async (req, res, next) => {
  try {
    const raw = token.readRefreshCookie(req, AUDIENCE);
    if (raw) {
      try {
        const decoded = token.verifyToken(raw, AUDIENCE, 'refresh');
        await sessionRepository.revokeToken(decoded.id, token.hashToken(raw));
      } catch {}
    }
    token.clearRefreshCookie(res, AUDIENCE);
    return res.json({ success: true, data: null });
  } catch (e) {
    return next(e);
  }
};
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await userRepository.findByEmail(email, true);
    if (!user)
      return res.json({
        success: true,
        data: null,
        message: 'Nếu email tồn tại, link khôi phục đã được gửi',
      });
    const raw = crypto.randomBytes(32).toString('hex');
    const resetHash = crypto.createHash('sha256').update(raw).digest('hex');
    await userRepository.setResetToken(user._id, resetHash, new Date(Date.now() + 3600000));
    try {
      await emailHelper.sendResetPasswordEmail(user.email, raw);
      return res.json({ success: true, data: null, message: 'Đã gửi email khôi phục' });
    } catch {
      await userRepository.setResetToken(user._id, null, null);
      return res
        .status(500)
        .json({ success: false, error: { code: 'EMAIL_FAILED', message: 'Không thể gửi email' } });
    }
  } catch (e) {
    if (e.name === 'ZodError')
      return res
        .status(400)
        .json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: e.errors[0].message },
        });
    return next(e);
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    const { token: raw, newPassword } = resetPasswordSchema.parse(req.body);
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const user = await userRepository.findByResetToken(hash);
    if (!user)
      return res
        .status(400)
        .json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Token không hợp lệ hoặc đã hết hạn' },
        });
    await userRepository.resetPassword(user._id, await bcrypt.hash(newPassword, 10));
    return res.json({ success: true, data: null, message: 'Đổi mật khẩu thành công' });
  } catch (e) {
    if (e.name === 'ZodError')
      return res
        .status(400)
        .json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: e.errors[0].message },
        });
    return next(e);
  }
};
