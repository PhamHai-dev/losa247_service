import axiosClient from '../../services/axiosClient'

const toList = (res) => ({
  items: res?.data || [], pagination: res?.pagination || null,
  requestedLocale: res?.requestedLocale, resolvedLocale: res?.resolvedLocale, isFallback: Boolean(res?.isFallback),
})

// ADMIN
export const faqsService = {
  getFaqs: (params) => axiosClient.get('/admin/faqs', { params }).then(toList),
  getStats: () => axiosClient.get('/admin/faqs/stats').then((res) => res?.data || {}),
  createFaq: (payload) => axiosClient.post('/admin/faqs', payload).then((res) => res?.data),
  updateFaq: (id, payload) => axiosClient.put(`/admin/faqs/${id}`, payload).then((res) => res?.data),
  deleteFaq: (id) => axiosClient.delete(`/admin/faqs/${id}`),
  reorder: (orderedIds, scope = {}) => axiosClient.patch('/admin/faqs/reorder', { orderedIds, ...scope }).then((res) => res?.data),
  getSuggestions: (search) => axiosClient.get('/admin/faqs/search-suggestions', { params: { search } }).then((res) => res?.data),
  translatePreview: (payload) => axiosClient.post('/admin/faqs/translate-preview', payload).then((res) => res?.data),
}

// CLIENT (public)
export const publicFaqsService = {
  getList: (params = {}, locale = 'vi') => axiosClient.get('/faqs', { params: { ...params, locale } }).then(toList),
}
