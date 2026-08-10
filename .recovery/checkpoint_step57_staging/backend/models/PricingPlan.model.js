const mongoose = require('mongoose');

const pricingPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: String,
      required: true,
      trim: true
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
      trim: true
    },
    buttonText: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
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

module.exports = mongoose.model('PricingPlan', pricingPlanSchema);

