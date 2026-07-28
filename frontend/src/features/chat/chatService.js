import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

// ADMIN
export const chatService = {
  getSessions: (params) => axiosClient.get('/admin/chat/sessions', { params }).then(toList),
  getMessages: (id) => axiosClient.get(`/admin/chat/sessions/${id}/messages`).then((res) => res?.data || []),
  takeover: (id) => axiosClient.post(`/admin/chat/sessions/${id}/takeover`).then((res) => res?.data),
  release: (id) => axiosClient.post(`/admin/chat/sessions/${id}/release`).then((res) => res?.data),
  setFeedback: (id, feedback) => axiosClient.patch(`/admin/chat/messages/${id}/feedback`, { feedback }).then((res) => res?.data),
}

// CLIENT
export const clientChatService = {
  // Backend startSession nhận { customerName, customerPhone }
  createSession: (payload = {}) => axiosClient.post('/chat/session', payload).then((res) => res?.data),
  getMessages: (sessionId) => axiosClient.get(`/chat/${sessionId}/messages`).then((res) => res?.data || []),
  uploadAttachment: (formData) => axiosClient.post('/chat/upload-attachment', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => res?.data),
}
