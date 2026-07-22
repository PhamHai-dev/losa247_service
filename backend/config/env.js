require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_ADMIN_SECRET: process.env.JWT_ADMIN_SECRET,
  JWT_CLIENT_SECRET: process.env.JWT_CLIENT_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || 465,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
};

// Kiểm tra xem các biến môi trường bắt buộc có tồn tại không
const requiredKeys = ['MONGO_URI', 'JWT_ADMIN_SECRET', 'JWT_CLIENT_SECRET'];
for (const key of requiredKeys) {
  if (!env[key]) {
    console.warn(`[WARNING] Thiếu biến môi trường bắt buộc: ${key}`);
  }
}

module.exports = env;
