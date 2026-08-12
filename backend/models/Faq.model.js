const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    page: {
      type: String,
      enum: ['home', 'solutions', 'pricing', 'blog'],
      default: 'home',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
    },
    serviceDetail: {
      type: String,
      enum: ['chatbot', 'crm', 'marketing'],
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

faqSchema.index({ page: 1, serviceDetail: 1, order: 1, createdAt: -1 });
faqSchema.index({ question: 'text', answer: 'text' });

module.exports = mongoose.model('Faq', faqSchema);
