const mongoose = require('mongoose');

const pricingComparisonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề so sánh là bắt buộc'],
      trim: true,
      maxlength: [160, 'Tiêu đề không được vượt quá 160 ký tự']
    },
    values: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    order: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

pricingComparisonSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('PricingComparison', pricingComparisonSchema);
