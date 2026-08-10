const Role = require('../../models/Role.model');

exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.json({ success: true, data: roles });
  } catch (err) {
    next(err);
  }
};

exports.createRole = async (req, res, next) => {
  try {
    const { name, permissions } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: { message: 'Vui lòng nhập tên vai trò' } });
    }

    const exist = await Role.findOne({ name });
    if (exist) {
      return res.status(400).json({ success: false, error: { message: 'Vai trò này đã tồn tại' } });
    }

    const role = new Role({
      name,
      permissions: permissions || [],
    });

    await role.save();
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { name, permissions } = req.body;
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, error: { message: 'Không tìm thấy vai trò' } });
    }

    if (name) role.name = name;
    if (permissions) role.permissions = permissions;

    await role.save();
    res.json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, error: { message: 'Không tìm thấy vai trò' } });
    }
    
    // In a real system, you might want to check if any users have this role before deleting
    // For now we allow deletion.
    await Role.deleteOne({ _id: role._id });
    res.json({ success: true, message: 'Đã xoá vai trò' });
  } catch (err) {
    next(err);
  }
};
