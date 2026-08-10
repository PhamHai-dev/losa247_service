const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    // 1. Kết nối đến MongoDB
    const conn = await mongoose.connect(env.MONGO_URI);
    
    // 2. Log thông báo kết nối thành công
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // 3. Log lỗi nếu kết nối thất bại và thoát ứng dụng
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
