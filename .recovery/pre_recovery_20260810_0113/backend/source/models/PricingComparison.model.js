const mongoose = require('mongoose');

const pricingComparisonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    values: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PricingComparison', pricingComparisonSchema);
