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
      select: false,
    },
    role: {
      type: String,
      default: 'customer',
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['active', 'locked'],
      default: 'active',
    },
    avatarUrl: {
      type: String,
    },
    refreshSessions: {
      type: [{
        tokenHash: { type: String, required: true },
        jti: { type: String, required: true },
        familyId: { type: String, required: true },
        audience: { type: String, enum: ['admin', 'client'], required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
        userAgent: String,
        ip: String,
      }],
      select: false,
      default: [],
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
