const { prisma } = require('./prisma');

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('MySQL Connected via Prisma');
  } catch (error) {
    console.error(`MySQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
