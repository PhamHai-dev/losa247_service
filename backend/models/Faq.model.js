const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
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
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Faq', faqSchema);
