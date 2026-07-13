const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
    },
    customerPhone: {
      type: String,
    },
    mode: {
      type: String,
      enum: ['bot', 'human'],
      default: 'bot',
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);
