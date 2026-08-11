const mongoose = require('mongoose');
const {
  normalizeRoleName,
  normalizePermissions,
  isValidPermission,
} = require('../constants/permissions');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z][a-z0-9_-]{1,31}$/, 'Tên vai trò không hợp lệ'],
    },
    permissions: {
      type: [String],
      default: [],
      set: normalizePermissions,
      validate: {
        validator(permissions) {
          const roleName = normalizeRoleName(this.name);
          return permissions.every((permission) => isValidPermission(permission) && (permission !== '*' || roleName === 'admin'));
        },
        message: 'Danh sách quyền chứa mã không hợp lệ',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
