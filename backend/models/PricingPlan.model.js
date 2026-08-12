const mongoose = require('mongoose');

const pricingPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên gói là bắt buộc'],
      trim: true,
      maxlength: [120, 'Tên gói không được vượt quá 120 ký tự']
    },
    price: {
      type: String,
      required: [true, 'Giá gói là bắt buộc'],
      trim: true,
      maxlength: [120, 'Giá không được vượt quá 120 ký tự']
    },
    subtitle: {
      type: [String],
      default: []
    },
    feature: {
      type: [String],
      default: []
    },
    badge: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ''
    },
    buttonText: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ''
    },
    order: {
      type: Number,
      min: 0,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

pricingPlanSchema.index({ isActive: 1, order: 1, createdAt: -1 });
pricingPlanSchema.index({ name: 1 });

module.exports = mongoose.model('PricingPlan', pricingPlanSchema);

