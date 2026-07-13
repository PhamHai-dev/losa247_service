import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

// ADMIN
export const faqsService = {
  getFaqs: (params) => axiosClient.get('/admin/faqs', { params }).then(toList),
  createFaq: (payload) => axiosClient.post('/admin/faqs', payload).then((res) => res?.data),
  updateFaq: (id, payload) => axiosClient.put(`/admin/faqs/${id}`, payload).then((res) => res?.data),
  deleteFaq: (id) => axiosClient.delete(`/admin/faqs/${id}`),
  reorder: (orderedIds) => axiosClient.patch('/admin/faqs/reorder', { orderedIds }).then((res) => res?.data),
  getSuggestions: (q) => axiosClient.get('/admin/faqs/search-suggestions', { params: { q } }).then((res) => res?.data),
}

// CLIENT (public)
export const publicFaqsService = {
  getList: (category) => axiosClient.get('/faqs', { params: category ? { category } : {} }).then(toList),
}
