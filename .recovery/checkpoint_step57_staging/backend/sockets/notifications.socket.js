module.exports = (io) => {
  const notifNs = io.of('/notifications');
  
  notifNs.on('connection', (socket) => {
    // Admin join để nhận thông báo
    socket.on('join_admin', () => {
      socket.join('admin_notifications');
    });
  });
};
