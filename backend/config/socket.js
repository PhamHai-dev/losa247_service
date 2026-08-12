const socketIo = require('socket.io');
const env = require('./env');

let io;

const initSocket = (server) => {
  // Socket.IO chỉ chấp nhận các frontend origin đã cấu hình.
  io = socketIo(server, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 1024 * 1024,
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
