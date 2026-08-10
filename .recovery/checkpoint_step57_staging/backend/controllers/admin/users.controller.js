const User = require('../../models/User.model');
const Role = require('../../models/Role.model');
const bcrypt = require('bcryptjs');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { normalizeRoleName } = require('../../constants/permissions');

exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, type } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });
    const filter = role ? { role: normalizeRoleName(role) } : { role: type === 'client' ? 'customer' : { $ne: 'customer' } };
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const [data, total] = await Promise.all([
      User.find(filter).select('-passwordHash -refreshTokens').sort({ createdAt: -1 }).skip(skip).limit(l),
      User.countDocuments(filter),
    ]);
    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const role = normalizeRoleName(req.body.role || 'editor');
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Tên, email và mật khẩu tối thiểu 6 ký tự là bắt buộc' } });
    }
    if (!await Role.exists({ name: role })) return res.status(400).json({ success: false, error: { code: 'ROLE_NOT_FOUND', message: 'Vai trò không tồn tại' } });
    if (await User.exists({ email: email.trim().toLowerCase() })) return res.status(400).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email đã tồn tại' } });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash, role });
    const userData = user.toObject();
    delete userData.passwordHash;
    delete userData.refreshTokens;
    res.status(201).json({ success: true, data: userData });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Người dùng không tồn tại' } });
    const isSelf = String(req.user._id) === String(user._id);
    if (isSelf && (req.body.status === 'locked' || (req.body.role && normalizeRoleName(req.body.role) !== user.role))) {
      return res.status(400).json({ success: false, error: { code: 'SELF_PROTECTION', message: 'Không thể tự khóa hoặc tự thay đổi vai trò' } });
    }
    if (req.body.role) {
      const role = normalizeRoleName(req.body.role);
      if (!await Role.exists({ name: role })) return res.status(400).json({ success: false, error: { code: 'ROLE_NOT_FOUND', message: 'Vai trò không tồn tại' } });
      user.role = role;
      user.refreshTokens = [];
    }
    if (req.body.status) {
      user.status = req.body.status;
      user.refreshTokens = [];
    }
    await user.save();
    const userData = user.toObject();
    delete userData.passwordHash;
    delete userData.refreshTokens;
    res.json({ success: true, data: userData });
  } catch (err) { next(err); }
};
