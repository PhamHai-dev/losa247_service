const { prisma } = require('../config/prisma');
const { verifyToken } = require('../helpers/token');

module.exports = (io) => {
  const notifNs = io.of('/notifications');

  notifNs.use(async (socket, next) => {
    try {
      const decoded = verifyToken(socket.handshake.auth?.token, 'admin', 'access');
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.status !== 'active' || user.roleName === 'customer') {
        return next(new Error('Unauthorized'));
      }

      socket.user = user;
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  notifNs.on('connection', (socket) => {
    socket.join('admin_notifications');
  });
};
