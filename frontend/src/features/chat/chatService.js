import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
const tokenHeaders = (token) => token ? { 'x-chat-session-token': token } : {}

// ADMIN
export const chatService = {
  getSessions: (params) => axiosClient.get('/admin/chat/sessions', { params }).then(toList),
  getMessages: (id) => axiosClient.get(`/admin/chat/sessions/${id}/messages`).then((res) => res?.data || []),
  sendMessage: (id, payload) => axiosClient.post(`/admin/chat/sessions/${id}/messages`, payload).then((res) => res?.data),
  takeover: (id) => axiosClient.post(`/admin/chat/sessions/${id}/takeover`).then((res) => res?.data),
  release: (id) => axiosClient.post(`/admin/chat/sessions/${id}/release`).then((res) => res?.data),
  createStreamTicket: () => axiosClient.post('/admin/chat/stream-ticket').then((res) => res?.data?.ticket),
  setFeedback: (id, feedback) => axiosClient.patch(`/admin/chat/messages/${id}/feedback`, { feedback }).then((res) => res?.data),
}

// CLIENT
export const clientChatService = {
  createSession: (payload = {}) => axiosClient.post('/chat/session', payload).then((res) => res?.data),
  getMessages: (sessionId, token, after) => axiosClient.get(`/chat/${sessionId}/messages`, { params: after ? { after } : undefined, headers: tokenHeaders(token) }).then((res) => res?.data || []),
  sendMessage: (sessionId, token, payload) => axiosClient.post(`/chat/sessions/${sessionId}/messages`, payload, { headers: tokenHeaders(token) }).then((res) => res?.data),
  requestHuman: (sessionId, token) => axiosClient.post(`/chat/sessions/${sessionId}/request-human`, {}, { headers: tokenHeaders(token) }).then((res) => res?.data),
  uploadAttachment: (formData, token) => axiosClient.post('/chat/upload-attachment', formData, { headers: { 'Content-Type': 'multipart/form-data', ...tokenHeaders(token) } }).then((res) => res?.data),
}
