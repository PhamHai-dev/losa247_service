const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    appearance: {
      themeMode: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      accentColor: {
        type: String,
        default: '#007bff',
      },
    },
    siteInfo: {
      name: String,
      slogan: String,
      logoUrl: String,
      faviconUrl: String,
      hotline: String,
      email: String,
      address: String,
      socialLinks: {
        facebook: String,
        zalo: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
