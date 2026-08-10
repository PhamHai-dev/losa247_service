const mongoose = require('mongoose');

const storeProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    platform: {
      type: String,
      enum: ['facebook', 'zalo', 'shopee', 'tiktok'],
      required: true,
    },
    description: {
      type: String,
    },
    workflowImageUrl: {
      type: String,
    },
    n8nWorkflowJson: {
      type: Object, // Lưu chuỗi hoặc object cấu hình JSON của workflow
    },
    status: {
      type: String,
      enum: ['visible', 'hidden'],
      default: 'visible',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StoreProduct', storeProductSchema);
