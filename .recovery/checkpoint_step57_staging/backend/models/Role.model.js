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
    },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: (permissions) => permissions.every(isValidPermission),
        message: 'Danh sách quyền chứa quyền không hợp lệ',
      },
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

roleSchema.pre('validate', function normalizeRole(next) {
  this.name = normalizeRoleName(this.name);
  this.permissions = normalizePermissions(this.permissions);
  next();
});

module.exports = mongoose.model('Role', roleSchema);
