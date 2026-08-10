const getPermissions = (req) => {
  const permissions = req.auth?.permissions || req.user?.permissions;
  return Array.isArray(permissions) ? permissions : [];
};

const hasPermission = (req, permission) => {
  const permissions = getPermissions(req);
  return permissions.includes('*') || permissions.includes(permission);
};

const deny = (res, missingPermissions) => res.status(403).json({
  success: false,
  error: {
    code: 'FORBIDDEN',
    message: 'Bạn không có quyền thực hiện hành động này',
    missingPermissions,
  },
});

const requireAnyPermission = (requiredPermissions = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Chưa xác thực' } });
  }
  if (!requiredPermissions.length || requiredPermissions.some((permission) => hasPermission(req, permission))) {
    return next();
  }
  return deny(res, requiredPermissions);
};

const requireAllPermissions = (requiredPermissions = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Chưa xác thực' } });
  }
  const missing = requiredPermissions.filter((permission) => !hasPermission(req, permission));
  return missing.length ? deny(res, missing) : next();
};

const requirePermission = (permission) => requireAllPermissions([permission]);

// Tương thích với cách gọi cũ: rbacMiddleware(['a', 'b']) yêu cầu một trong các quyền.
const rbacMiddleware = (requiredPermissions = []) => requireAnyPermission(requiredPermissions);

module.exports = rbacMiddleware;
module.exports.requirePermission = requirePermission;
module.exports.requireAnyPermission = requireAnyPermission;
module.exports.requireAllPermissions = requireAllPermissions;
module.exports.hasPermission = hasPermission;

