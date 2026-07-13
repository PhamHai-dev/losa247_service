const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'sales', 'editor', 'customer'],
      default: 'customer',
    },
    permissions: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'locked'],
      default: 'active',
    },
    avatarUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
