const mongoose = require('mongoose');

const apiConfigSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['facebook', 'zalo', 'anthropic', 'openai', 'n8n'],
      required: true,
      unique: true,
    },
    apiKey: {
      type: String,
    },
    extra: {
      type: Object, // Lưu các cấu hình khác (ví dụ: webhookUrl, pageId...)
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ApiConfig', apiConfigSchema);
