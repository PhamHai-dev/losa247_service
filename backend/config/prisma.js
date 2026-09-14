const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const globalForPrisma = globalThis;

const createPrismaClient = () => {
  const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
  const parsed = new URL(env.DATABASE_URL);
  const adapter = new PrismaMariaDb({
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port, 10) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    connectionLimit: env.DATABASE_POOL_SIZE,
  });

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
};

const prisma = globalForPrisma.__losaPrisma || createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.__losaPrisma = prisma;
}

const connectPrisma = async () => {
  if (!env.DATABASE_URL) {
    throw new Error('Thiếu biến môi trường bắt buộc: DATABASE_URL');
  }
  await prisma.$connect();
  console.log('MySQL Connected via Prisma (driver adapter)');
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
