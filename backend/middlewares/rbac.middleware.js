const getPermissions = (req) => {
  const permissions = req.auth?.permissions || req.user?.permissions;
  return Array.isArray(permissions) ? permissions : [];
};

const isSuperAdmin = (req, permissions) => req.auth?.role?.name === 'admin' && permissions.includes('*');

const deny = (res, missingPermissions) => res.status(403).json({
  success: false,
  error: {
    code: 'MISSING_PERMISSION',
    message: 'Bạn không có quyền thực hiện hành động này',
    permissions: missingPermissions,
  },
});

const checkPermissions = (requiredPermissions, mode = 'any') => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Chưa xác thực' } });
  }

  const required = Array.isArray(requiredPermissions) ? requiredPermissions.filter(Boolean) : [requiredPermissions].filter(Boolean);
  const permissions = getPermissions(req);
  if (isSuperAdmin(req, permissions) || required.length === 0) return next();

  const allowed = mode === 'all'
    ? required.every((permission) => permissions.includes(permission))
    : required.some((permission) => permissions.includes(permission));
  if (!allowed) return deny(res, required.filter((permission) => !permissions.includes(permission)));
  return next();
};

const rbacMiddleware = (requiredPermissions = []) => checkPermissions(requiredPermissions, 'any');
rbacMiddleware.requirePermission = (permission) => checkPermissions([permission], 'all');
rbacMiddleware.requireAnyPermission = (permissions) => checkPermissions(permissions, 'any');
rbacMiddleware.requireAllPermissions = (permissions) => checkPermissions(permissions, 'all');

module.exports = rbacMiddleware;
