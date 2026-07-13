const User = require('../../models/User.model');
const bcrypt = require('bcryptjs');
const { paginate, buildPaginationResponse } = require('../../helpers/format');

exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = {};
    if (role) filter.role = role;
    else filter.role = { $in: ['admin', 'sales', 'editor'] };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(l),
      User.countDocuments(filter),
    ]);

    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, permissions } = req.body;
    
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email đã tồn tại' } });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      passwordHash,
      role: role || 'editor',
      permissions: permissions || [],
    });

    await user.save();
    
    const userData = user.toObject();
    delete userData.passwordHash;

    res.status(201).json({ success: true, data: userData });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { role, status, permissions } = req.body;
    const updateData = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (permissions) updateData.permissions = permissions;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Người dùng không tồn tại' } });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.updatePermissions = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'API cập nhật ma trận phân quyền đang được phát triển.' });
  } catch (err) {
    next(err);
  }
};
