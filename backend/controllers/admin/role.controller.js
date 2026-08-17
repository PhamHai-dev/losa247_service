const { roleRepository, userRepository } = require('../../repositories/core/identityRepository');
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
  try { return res.json({ success: true, data: await roleRepository.list() }); }
  catch (err) { return next(err); }
};

exports.createRole = async (req, res, next) => {
  try {
    const name = normalizeRoleName(req.body.name);
    if (!name) return error(res, 400, 'VALIDATION_ERROR', 'Vui lòng nhập tên vai trò');
    if (SYSTEM_ROLES.includes(name)) return error(res, 403, 'SYSTEM_ROLE_PROTECTED', 'Không thể tạo hoặc thay thế vai trò hệ thống');
    const { normalized, invalid } = validatePermissions(name, req.body.permissions || []);
    if (invalid.length) return error(res, 400, 'INVALID_PERMISSIONS', 'Danh sách quyền không hợp lệ', { permissions: invalid });
    if (await roleRepository.existsName(name)) return error(res, 409, 'ROLE_EXISTS', 'Vai trò này đã tồn tại');
    return res.status(201).json({ success: true, data: await roleRepository.create({ name, permissions: normalized }) });
  } catch (err) { return next(err); }
};

exports.updateRole = async (req, res, next) => {
  try {
    const role = await roleRepository.findById(req.params.id);
    if (!role) return error(res, 404, 'ROLE_NOT_FOUND', 'Không tìm thấy vai trò');
    const currentName = normalizeRoleName(role.name);
    const requestedName = req.body.name === undefined ? currentName : normalizeRoleName(req.body.name);
    if (SYSTEM_ROLES.includes(currentName) && requestedName !== currentName) return error(res, 403, 'SYSTEM_ROLE_PROTECTED', 'Không thể đổi tên vai trò hệ thống');
    if (!requestedName) return error(res, 400, 'VALIDATION_ERROR', 'Tên vai trò không hợp lệ');
    if (requestedName !== currentName && await roleRepository.existsName(requestedName, role.id)) return error(res, 409, 'ROLE_EXISTS', 'Vai trò này đã tồn tại');
    if (requestedName !== currentName && await userRepository.roleInUse(currentName)) return error(res, 409, 'ROLE_IN_USE', 'Không thể đổi tên vai trò đang được sử dụng');
    const data = { name: requestedName };
    if (req.body.permissions !== undefined) {
      if (currentName === 'admin') return error(res, 403, 'SYSTEM_ROLE_PROTECTED', 'Quyền của admin không thể chỉnh sửa');
      const { normalized, invalid } = validatePermissions(requestedName, req.body.permissions);
      if (invalid.length) return error(res, 400, 'INVALID_PERMISSIONS', 'Danh sách quyền không hợp lệ', { permissions: invalid });
      data.permissions = normalized;
    }
    return res.json({ success: true, data: await roleRepository.update(role.id, data) });
  } catch (err) { return next(err); }
};

exports.bulkUpdatePermissions = async (req, res, next) => {
  try {
    const updates = Array.isArray(req.body.updates) ? req.body.updates : [];
    if (!updates.length) return error(res, 400, 'VALIDATION_ERROR', 'Danh sách cập nhật trống');
    const ids = updates.map((item) => String(item.roleId));
    const roles = await roleRepository.findByIds([...new Set(ids)]);
    if (roles.length !== new Set(ids).size) return error(res, 404, 'ROLE_NOT_FOUND', 'Có vai trò không tồn tại');
    const byId = new Map(roles.map((role) => [role.id, role]));
    const prepared = [];
    for (const update of updates) {
      const role = byId.get(String(update.roleId));
      if (SYSTEM_ROLES.includes(role.name)) return error(res, 403, 'SYSTEM_ROLE_PROTECTED', `Không thể sửa quyền vai trò ${role.name}`);
      const { normalized, invalid } = validatePermissions(role.name, update.permissions);
      if (invalid.length) return error(res, 400, 'INVALID_PERMISSIONS', 'Danh sách quyền không hợp lệ', { role: role.name, permissions: invalid });
      prepared.push({ role, permissions: normalized });
    }
    const data = await Promise.all(prepared.map(({ role, permissions }) => roleRepository.update(role.id, { permissions })));
    return res.json({ success: true, data });
  } catch (err) { return next(err); }
};

exports.deleteRole = async (req, res, next) => {
  try {
    const role = await roleRepository.findById(req.params.id);
    if (!role) return error(res, 404, 'ROLE_NOT_FOUND', 'Không tìm thấy vai trò');
    if (SYSTEM_ROLES.includes(role.name)) return error(res, 403, 'SYSTEM_ROLE_PROTECTED', 'Không thể xóa vai trò hệ thống');
    const userCount = await userRepository.countByRole(role.name);
    if (userCount) return error(res, 409, 'ROLE_IN_USE', `Vai trò đang được ${userCount} người dùng sử dụng`, { userCount });
    await roleRepository.delete(role.id);
    return res.json({ success: true, data: null, message: 'Đã xóa vai trò' });
  } catch (err) { return next(err); }
};
