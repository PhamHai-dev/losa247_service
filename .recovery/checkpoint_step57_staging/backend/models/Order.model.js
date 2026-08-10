const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },
    items: [
      {
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        storeProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreProduct' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, default: 1 },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
    },
    paymentProofUrl: {
      type: String,
    },
    activatedAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
