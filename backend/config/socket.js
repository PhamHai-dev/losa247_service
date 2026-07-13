const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
  // 1. Khởi tạo Socket.io server với CORS
  io = socketIo(server, {
    cors: {
      origin: '*', // Trong thực tế nên cấu hình domain cụ thể
      methods: ['GET', 'POST'],
    },
  });

  // 2. Log thông báo khởi tạo thành công
  console.log('Socket.io initialized');

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIo };
