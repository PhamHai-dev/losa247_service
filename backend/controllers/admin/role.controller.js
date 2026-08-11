const Role = require('../../models/Role.model');
const User = require('../../models/User.model');
const {
  PERMISSION_GROUPS,
  SYSTEM_ROLES,
  normalizeRoleName,
  normalizePermissions,
  isValidPermission,
} = require('../../constants/permissions');

const error = (res, status, code, message, details) => res.status(status).json({
  success: false,
  error: { code, message, ...(details || {}) },
});

const validatePermissions = (name, permissions) => {
  const normalized = normalizePermissions(permissions);
  const invalid = normalized.filter((permission) => !isValidPermission(permission) || (permission === '*' && name !== 'admin'));
  return { normalized: name === 'admin' ? ['*'] : normalized, invalid };
};

exports.getPermissionCatalog = async (_req, res) => res.json({
  success: true,
  data: Object.entries(PERMISSION_GROUPS).map(([resource, permissions]) => ({
    resource,
    permissions,
    actions: permissions.map((permission) => permission.split('.')[1]),
  })),
});

exports.getRoles = async (_req, res, next) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    return res.json({ success: true, data: roles });
  } catch (err) { return next(err); }
};

exports.createRole = async (req, res, next) => {
  try {
    const name = normalizeRoleName(req.body.name);
    if (!name) return error(res, 400, 'VALIDATION_ERROR', 'Vui lòng nhập tên vai trò');
    if (SYSTEM_ROLES.includes(name)) return error(res, 403, 'SYSTEM_ROLE_PROTECTED', 'Không thể tạo hoặc thay thế vai trò hệ thống');
    const { normalized, invalid } = validatePermissions(name, req.body.permissions || []);
    if (invalid.length) return error(res, 400, 'INVALID_PERMISSIONS', 'Danh sách quyền không hợp lệ', { permissions: invalid });
    if (await Role.exists({ name })) return error(res, 409, 'ROLE_EXISTS', 'Vai trò này đã tồn tại');
    const role = await Role.create({ name, permissions: normalized });
    return res.status(201).json({ success: true, data: role });
  } catch (err) { return next(err); }
};

exports.updateRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return error(res, 404, 'ROLE_NOT_FOUND', 'Không tìm thấy vai trò');
    const currentName = normalizeRoleName(role.name);
    const requestedName = req.body.name === undefined ? currentName : normalizeRoleName(req.body.name);
    if (SYSTEM_ROLES.includes(currentName) && requestedName !== currentName) {
      return error(res, 403, 'SYSTEM_ROLE_PROTECTED', 'Không thể đổi tên vai trò hệ thống');
    }
    if (!requestedName) return error(res, 400, 'VALIDATION_ERROR', 'Tên vai trò không hợp lệ');
    if (requestedName !== currentName && await Role.exists({ name: requestedName, _id: { $ne: role._id } })) {
      return error(res, 409, 'ROLE_EXISTS', 'Vai trò này đã tồn tại');
    }
    if (requestedName !== currentName && await User.exists({ role: currentName })) {
      return error(res, 409, 'ROLE_IN_USE', 'Không thể đổi tên vai trò đang được sử dụng');
    }
    role.name = requestedName;
    if (req.body.permissions !== undefined) {
      if (currentName === 'admin') return error(res, 403, 'SYSTEM_ROLE_PROTECTED', 'Quyền của admin không thể chỉnh sửa');
      const { normalized, invalid } = validatePermissions(requestedName, req.body.permissions);
      if (invalid.length) return error(res, 400, 'INVALID_PERMISSIONS', 'Danh sách quyền không hợp lệ', { permissions: invalid });
      role.permissions = normalized;
    }
    await role.save();
    return res.json({ success: true, data: role });
  } catch (err) { return next(err); }
};

exports.bulkUpdatePermissions = async (req, res, next) => {
  try {
    const updates = Array.isArray(req.body.updates) ? req.body.updates : [];
    if (!updates.length) return error(res, 400, 'VALIDATION_ERROR', 'Danh sách cập nhật trống');
    const ids = updates.map((item) => item.roleId);
    const roles = await Role.find({ _id: { $in: ids } });
    if (roles.length !== new Set(ids.map(String)).size) return error(res, 404, 'ROLE_NOT_FOUND', 'Có vai trò không tồn tại');
    const byId = new Map(roles.map((role) => [String(role._id), role]));
    for (const update of updates) {
      const role = byId.get(String(update.roleId));
      if (SYSTEM_ROLES.includes(role.name)) return error(res, 403, 'SYSTEM_ROLE_PROTECTED', `Không thể sửa quyền vai trò ${role.name}`);
      const { normalized, invalid } = validatePermissions(role.name, update.permissions);
      if (invalid.length) return error(res, 400, 'INVALID_PERMISSIONS', 'Danh sách quyền không hợp lệ', { role: role.name, permissions: invalid });
      role.permissions = normalized;
    }
    await Promise.all(roles.map((role) => role.save()));
    return res.json({ success: true, data: roles });
  } catch (err) { return next(err); }
};

exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return error(res, 404, 'ROLE_NOT_FOUND', 'Không tìm thấy vai trò');
    if (SYSTEM_ROLES.includes(role.name)) return error(res, 403, 'SYSTEM_ROLE_PROTECTED', 'Không thể xóa vai trò hệ thống');
    const userCount = await User.countDocuments({ role: role.name });
    if (userCount) return error(res, 409, 'ROLE_IN_USE', `Vai trò đang được ${userCount} người dùng sử dụng`, { userCount });
    await role.deleteOne();
    return res.json({ success: true, data: null, message: 'Đã xóa vai trò' });
  } catch (err) { return next(err); }
};

