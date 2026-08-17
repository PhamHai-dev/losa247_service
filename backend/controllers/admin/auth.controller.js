const bcrypt = require('bcryptjs');
const {
  roleRepository,
  userRepository,
  sessionRepository,
} = require('../../repositories/core/identityRepository');
const { loginSchema } = require('../../validators/admin/auth.validator');
const { normalizeRoleName } = require('../../constants/permissions');
const token = require('../../helpers/token');
const AUDIENCE = 'admin';

const findAdminRole = async (user) => {
  const name = normalizeRoleName(user?.role);
  if (!name || name === 'customer' || user?.status !== 'active') return null;
  return roleRepository.findByName(name);
};
const serialize = (user, role) =>
  token.serializeUser(user, {
    role: normalizeRoleName(user.role),
    permissions: role.name === 'admin' ? ['*'] : role.permissions,
  });
const sessionOf = (issued, req) => ({
  tokenHash: token.hashToken(issued.token),
  jti: issued.jti,
  familyId: issued.familyId,
  audience: AUDIENCE,
  expiresAt: issued.expiresAt,
  userAgent: String(req.get('user-agent') || '').slice(0, 300),
  ip: req.ip,
});

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
    const role = await findAdminRole(user);
    if (!role)
      return res
        .status(403)
        .json({
          success: false,
          error: {
            code: user.status !== 'active' ? 'ACCOUNT_LOCKED' : 'ADMIN_ACCESS_DENIED',
            message: 'Không có quyền truy cập quản trị',
          },
        });
    const refresh = token.createRefreshToken(user, AUDIENCE);
    await sessionRepository.replaceForLogin(user.id, sessionOf(refresh, req));
    token.setRefreshCookie(res, AUDIENCE, refresh.token);
    return res.json({
      success: true,
      data: { accessToken: token.signAccessToken(user, AUDIENCE), user: serialize(user, role) },
    });
  } catch (error) {
    if (error.name === 'ZodError')
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.errors?.[0]?.message || 'Dữ liệu không hợp lệ',
          },
        });
    return next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const role = req.auth?.role || (await findAdminRole(req.user));
    if (!role)
      return res
        .status(403)
        .json({
          success: false,
          error: { code: 'ROLE_NOT_FOUND', message: 'Vai trò không hợp lệ' },
        });
    return res.json({ success: true, data: serialize(req.user, role) });
  } catch (error) {
    return next(error);
  }
};

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
    const user = await userRepository.findById(decoded.id, true);
    const session =
      user && (await sessionRepository.findValid(user.id, token.hashToken(raw), AUDIENCE));
    if (!session) {
      if (user && decoded.familyId) await sessionRepository.revokeFamily(user.id, decoded.familyId);
      token.clearRefreshCookie(res, AUDIENCE);
      return res
        .status(401)
        .json({ success: false, error: { code: 'TOKEN_REUSE', message: 'Phiên đã bị thu hồi' } });
    }
    const role = await findAdminRole(user);
    if (!role) {
      await sessionRepository.revokeById(session.id);
      token.clearRefreshCookie(res, AUDIENCE);
      return res
        .status(403)
        .json({
          success: false,
          error: { code: 'ACCOUNT_LOCKED', message: 'Phiên quản trị không còn hợp lệ' },
        });
    }
    const fresh = token.createRefreshToken(user, AUDIENCE, decoded.familyId);
    await sessionRepository.rotate(session.id, sessionOf(fresh, req));
    token.setRefreshCookie(res, AUDIENCE, fresh.token);
    return res.json({
      success: true,
      data: { accessToken: token.signAccessToken(user, AUDIENCE), user: serialize(user, role) },
    });
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const raw = token.readRefreshCookie(req, AUDIENCE);
    if (raw) {
      try {
        const decoded = token.verifyToken(raw, AUDIENCE, 'refresh');
        await sessionRepository.revokeToken(decoded.id, token.hashToken(raw));
      } catch {
        /* Invalid cookies are cleared below. */
      }
    }
    token.clearRefreshCookie(res, AUDIENCE);
    return res.json({ success: true, data: null });
  } catch (error) {
    return next(error);
  }
};
