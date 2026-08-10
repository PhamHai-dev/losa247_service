const Role = require('../../models/Role.model');
const User = require('../../models/User.model');
const {
  PERMISSION_GROUPS,
  SYSTEM_ROLES,
  normalizeRoleName,
  normalizePermissions,
  isValidPermission,
} = require('../../constants/permissions');

const validatePermissions = (permissions) => {
  const normalized = normalizePermissions(permissions);
  const invalid = normalized.filter((permission) => !isValidPermission(permission) || permission === '*');
  return { normalized, invalid };
};

exports.bulkUpdatePermissions = async (req, res, next) => {
  try {
    const updates = Array.isArray(req.body.roles) ? req.body.roles : [];
    if (!updates.length) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Không có thay đổi quyền để cập nhật' } });
    }
    const ids = updates.map((item) => item.id);
    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE_ROLE', message: 'Danh sách cập nhật chứa role trùng lặp' } });
    }
    const roles = await Role.find({ _id: { $in: ids } });
    if (roles.length !== updates.length) {
      return res.status(404).json({ success: false, error: { code: 'ROLE_NOT_FOUND', message: 'Có vai trò không tồn tại' } });
    }
    const roleById = new Map(roles.map((role) => [String(role._id), role]));
    const prepared = [];
    for (const update of updates) {
      const role = roleById.get(String(update.id));
      if (role.name === 'admin') {
        return res.status(400).json({ success: false, error: { code: 'SYSTEM_ROLE', message: 'Không thể thay đổi quyền super admin' } });
      }
      const { normalized, invalid } = validatePermissions(update.permissions);
      if (invalid.length) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_PERMISSIONS', message: `Vai trò ${role.name} có quyền không hợp lệ`, invalid } });
      }
      prepared.push({ role, permissions: normalized });
    }
    await Role.bulkWrite(prepared.map(({ role, permissions }) => ({
      updateOne: { filter: { _id: role._id }, update: { $set: { permissions } } },
    })));
    const updatedRoles = await Role.find({ _id: { $in: ids } });
    res.json({ success: true, data: updatedRoles, message: 'Đã cập nhật quyền' });
  } catch (err) { next(err); }
};

exports.getPermissionCatalog = (req, res) => {
  res.json({ success: true, data: PERMISSION_GROUPS });
};

exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.json({ success: true, data: roles });
  } catch (err) { next(err); }
};

exports.createRole = async (req, res, next) => {
  try {
    const name = normalizeRoleName(req.body.name);
    const { normalized, invalid } = validatePermissions(req.body.permissions);
    if (!name || !/^[a-z][a-z0-9_-]*$/.test(name)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_ROLE', message: 'Tên vai trò không hợp lệ' } });
    }
    if (invalid.length) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PERMISSIONS', message: 'Có quyền không hợp lệ', invalid } });
    }
    if (await Role.exists({ name })) {
      return res.status(400).json({ success: false, error: { code: 'ROLE_EXISTS', message: 'Vai trò này đã tồn tại' } });
    }
    const role = await Role.create({ name, permissions: normalized, isSystem: false });
    res.status(201).json({ success: true, data: role });
  } catch (err) { next(err); }
};

exports.updateRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy vai trò' } });
    const protectedRole = role.isSystem || SYSTEM_ROLES.includes(role.name);
    const nextName = normalizeRoleName(req.body.name || role.name);
    if (protectedRole && nextName !== role.name) {
      return res.status(400).json({ success: false, error: { code: 'SYSTEM_ROLE', message: 'Không thể đổi tên vai trò hệ thống' } });
    }
    if (req.body.permissions) {
      const { normalized, invalid } = validatePermissions(req.body.permissions);
      if (invalid.length) return res.status(400).json({ success: false, error: { code: 'INVALID_PERMISSIONS', message: 'Có quyền không hợp lệ', invalid } });
      role.permissions = role.name === 'admin' ? ['*'] : normalized;
    }
    role.name = nextName;
    await role.save();
    res.json({ success: true, data: role });
  } catch (err) { next(err); }
};

exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy vai trò' } });
    if (role.isSystem || SYSTEM_ROLES.includes(role.name)) {
      return res.status(400).json({ success: false, error: { code: 'SYSTEM_ROLE', message: 'Không thể xóa vai trò hệ thống' } });
    }
    const usersCount = await User.countDocuments({ role: role.name });
    if (usersCount) return res.status(409).json({ success: false, error: { code: 'ROLE_IN_USE', message: `Vai trò đang được ${usersCount} người dùng sử dụng`, usersCount } });
    await role.deleteOne();
    res.json({ success: true, message: 'Đã xoá vai trò' });
  } catch (err) { next(err); }
};

