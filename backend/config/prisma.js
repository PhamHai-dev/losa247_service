const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const globalForPrisma = globalThis;

const prisma = globalForPrisma.__losaPrisma || new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (env.NODE_ENV !== 'production') {
  globalForPrisma.__losaPrisma = prisma;
}

const connectPrisma = async () => {
  if (!env.DATABASE_URL) {
    throw new Error('Thiếu biến môi trường bắt buộc: DATABASE_URL');
  }

  await prisma.$connect();
  console.log('MySQL Connected via Prisma');
  return prisma;
};

const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

module.exports = {
  prisma,
  connectPrisma,
  disconnectPrisma,
};
