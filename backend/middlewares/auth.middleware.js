const { verifyToken } = require('../helpers/token');
const { roleRepository, userRepository } = require('../repositories/core/identityRepository');
const { normalizeRoleName } = require('../constants/permissions');

const authMiddleware = (type = 'client') => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !/^Bearer\s+\S+$/.test(authHeader)) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Không tìm thấy token' } });
    let decoded;
    try { decoded = verifyToken(authHeader.replace(/^Bearer\s+/, ''), type, 'access'); }
    catch { return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token không hợp lệ hoặc đã hết hạn' } }); }
    const user = await userRepository.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Người dùng không tồn tại' } });
    if (user.status !== 'active') return res.status(403).json({ success: false, error: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa' } });
    const roleName = normalizeRoleName(user.role);
    let role = null;
    let permissions = [];
    if (type === 'admin') {
      if (!roleName || roleName === 'customer') return res.status(403).json({ success: false, error: { code: 'ADMIN_ACCESS_DENIED', message: 'Không có quyền truy cập quản trị' } });
      role = await roleRepository.findByName(roleName);
      if (!role) return res.status(403).json({ success: false, error: { code: 'ROLE_NOT_FOUND', message: 'Vai trò quản trị không còn tồn tại' } });
      permissions = roleName === 'admin' ? ['*'] : role.permissions;
    }
    user.role = roleName;
    user.permissions = permissions;
    req.user = user;
    req.auth = { user, role, permissions };
    next();
  } catch (error) { next(error); }
};

module.exports = authMiddleware;
