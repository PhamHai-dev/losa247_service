const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
    },
    sender: {
      type: String,
      enum: ['customer', 'bot', 'admin'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    feedback: {
      type: String,
      enum: ['up', 'down', null],
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
