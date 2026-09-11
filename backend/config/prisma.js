const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const env = require('./env');

const globalForPrisma = globalThis;

const parseDbUrl = (url) => {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port, 10) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    connectionLimit: 3,
  };
};

const createPrismaClient = () => {
  const adapter = new PrismaMariaDb(parseDbUrl(env.DATABASE_URL));
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