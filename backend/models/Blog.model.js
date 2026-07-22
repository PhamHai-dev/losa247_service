const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    excerpt: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogTag',
    }],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    allowIndexing: {
      type: Boolean,
      default: true,
    },
    content: {
      type: String,
      required: true,
    },
    coverImageUrl: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogCategory',
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft',
    },
    source: {
      type: String,
      enum: ['manual', 'facebook_crawl'],
      default: 'manual',
    },
    publishedAt: {
      type: Date,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Blog', blogSchema);
