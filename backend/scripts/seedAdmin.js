const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');
const { createEntityId } = require('../repositories/core/entityId');

const seedAdmin = async () => {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@gmail.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'password123';

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.role.upsert({
      where: { name: 'admin' },
      update: {
        permissions: ['*'],
      },
      create: {
        id: createEntityId(),
        name: 'admin',
        permissions: ['*'],
      },
    });

    await prisma.user.upsert({
      where: { email },
      update: {
        name: 'Super Admin',
        passwordHash,
        roleName: 'admin',
        status: 'active',
      },
      create: {
        id: createEntityId(),
        name: 'Super Admin',
        email,
        passwordHash,
        roleName: 'admin',
        status: 'active',
      },
    });

    console.log(`Đã tạo/cập nhật tài khoản admin:\nEmail: ${email}\nPass: ${password}`);
  } catch (error) {
    console.error('Lỗi tạo admin:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

seedAdmin();
