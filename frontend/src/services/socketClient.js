import { io } from 'socket.io-client'
import { getAccessToken } from './authSession'

// Base URL cho socket: tách phần /api/v1 khỏi VITE_API_BASE_URL, hoặc dùng VITE_SOCKET_URL riêng.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/v1\/?$/, '')

// Mỗi namespace giữ 1 instance để tái sử dụng trong toàn app.
const sockets = {}

export function getSocket(namespace = '/chat') {
  if (!sockets[namespace]) {
    sockets[namespace] = io(`${SOCKET_URL}${namespace}`, {
      autoConnect: false,
      transports: ['websocket'],
      auth: (cb) => cb({ token: getAccessToken() || null }),
      withCredentials: true,
    })
  }
  return sockets[namespace]
}

export function disconnectSocket(namespace) {
  if (sockets[namespace]) {
    sockets[namespace].disconnect()
    delete sockets[namespace]
  }
}
