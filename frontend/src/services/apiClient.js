import { services, products, blogs, faqs, leads, orders, users, logs, chatSessions, kpis } from '../data/mockData'
import { getAccessToken } from './authSession'

// URL backend lấy từ .env frontend. Nếu chưa có, dùng cổng backend mặc định.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

// Hàm giả lập độ trễ mạng để UI vẫn chạy khi backend chưa bật.
const wait = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 120))

export const mockApi = {
  getDashboard: () => wait({ kpis }),
  getServices: () => wait(services),
  getProducts: () => wait(products),
  getBlogs: () => wait(blogs),
  getFaqs: () => wait(faqs),
  getLeads: () => wait(leads),
  getOrders: () => wait(orders),
  getUsers: () => wait(users),
  getLogs: () => wait(logs),
  getChatSessions: () => wait(chatSessions),
}

async function request(path, options = {}) {
  try {
    const token = getAccessToken()
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...options,
    })
    if (!response.ok) throw new Error(`API error ${response.status}`)
    return response.json()
  } catch (error) {
    // Fallback giúp demo không bị trắng trang khi chưa chạy backend/MongoDB.
    console.warn('[LOSA247 API fallback mock]', path, error.message)
    return { ok: false, fallback: true }
  }
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, payload) => request(path, { method: 'POST', body: JSON.stringify(payload) }),
  patch: (path, payload) => request(path, { method: 'PATCH', body: JSON.stringify(payload) }),
  put: (path, payload) => request(path, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

