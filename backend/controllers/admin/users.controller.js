const bcrypt = require('bcryptjs');
const { roleRepository, userRepository } = require('../../repositories/core/identityRepository');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { normalizeRoleName } = require('../../constants/permissions');

const fail = (res, status, code, message) => res.status(status).json({ success: false, error: { code, message } });
const can = (req, permission) => req.auth?.permissions?.includes('*') || req.auth?.permissions?.includes(permission);

exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, type } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(req.query, { page, limit });
    const { rows, total } = await userRepository.list({
      skip,
      take: pageLimit,
      search,
      roleName: role ? normalizeRoleName(role) : null,
      clientsOnly: type === 'client',
    });
    return res.json(buildPaginationResponse(rows, total, currentPage, pageLimit));
  } catch (err) { return next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const roleName = normalizeRoleName(req.body.role || 'editor');
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return fail(res, 400, 'VALIDATION_ERROR', 'Tên, email hoặc mật khẩu không hợp lệ');
    if (!await roleRepository.findByName(roleName)) return fail(res, 400, 'ROLE_NOT_FOUND', 'Vai trò không tồn tại');
    if (await userRepository.existsEmail(email)) return fail(res, 409, 'EMAIL_EXISTS', 'Email đã tồn tại');
    const data = await userRepository.create({ name, email, passwordHash: await bcrypt.hash(password, 10), role: roleName });
    return res.status(201).json({ success: true, data });
  } catch (err) { return next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const target = await userRepository.findById(req.params.id);
    if (!target) return fail(res, 404, 'NOT_FOUND', 'Người dùng không tồn tại');
    const isSelf = target.id === String(req.user._id);
    if (req.body.role !== undefined && !can(req, 'users.update')) return fail(res, 403, 'MISSING_PERMISSION', 'Thiếu quyền users.update');
    if (req.body.status !== undefined && !can(req, 'users.lock')) return fail(res, 403, 'MISSING_PERMISSION', 'Thiếu quyền users.lock');
    const nextRole = req.body.role === undefined ? target.role : normalizeRoleName(req.body.role);
    const nextStatus = req.body.status === undefined ? target.status : req.body.status;
    if (!['active', 'locked'].includes(nextStatus)) return fail(res, 400, 'VALIDATION_ERROR', 'Trạng thái không hợp lệ');
    if (!await roleRepository.findByName(nextRole)) return fail(res, 400, 'ROLE_NOT_FOUND', 'Vai trò không tồn tại');
    if (isSelf && (nextStatus !== 'active' || nextRole !== target.role)) return fail(res, 403, 'SELF_PROTECTION', 'Không thể tự khóa hoặc tự thay đổi vai trò');
    if (target.role === 'admin' && (nextRole !== 'admin' || nextStatus !== 'active')) {
      const activeAdmins = await userRepository.countByRole('admin', 'active');
      if (activeAdmins <= 1) return fail(res, 409, 'LAST_SUPER_ADMIN', 'Không thể vô hiệu hóa super admin cuối cùng');
    }
    const authorizationChanged = nextRole !== target.role || nextStatus !== target.status;
    const data = await userRepository.updateAuthorization(target.id, nextRole, nextStatus, authorizationChanged);
    return res.json({ success: true, data });
  } catch (err) { return next(err); }
};
