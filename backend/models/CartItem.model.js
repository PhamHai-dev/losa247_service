const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    userId: {
      // sessionId hoặc userId
      type: String,
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    storeProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreProduct',
    },
    qty: {
      type: Number,
      required: true,
      default: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    remindedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CartItem', cartItemSchema);
