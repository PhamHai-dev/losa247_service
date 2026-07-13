const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const env = require('../config/env');

const seedAdmin = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to DB');

    const email = 'admin@gmail.com';
    const password = 'password123';

    // Xoá user cũ nếu bị lỗi
    await User.deleteOne({ email });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = new User({
      name: 'Super Admin',
      email,
      passwordHash,
      role: 'admin',
      permissions: ['manage_users', 'manage_orders', 'manage_blogs'],
      status: 'active',
    });

    await admin.save();
    console.log(`Đã tạo thành công tài khoản admin:\nEmail: ${email}\nPass: ${password}`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Lỗi tạo admin:', error);
    mongoose.disconnect();
  }
};

seedAdmin();
