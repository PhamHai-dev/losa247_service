import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

// ADMIN
export const servicesService = {
  getServices: (params) => axiosClient.get('/admin/services', { params }).then(toList),
  createService: (payload) => axiosClient.post('/admin/services', payload).then((res) => res?.data),
  updateService: (id, payload) => axiosClient.put(`/admin/services/${id}`, payload).then((res) => res?.data),
  deleteService: (id) => axiosClient.delete(`/admin/services/${id}`),
}

// CLIENT (public)
export const publicServicesService = {
  getList: (params) => axiosClient.get('/services', { params }).then(toList),
  getBySlug: (slug) => axiosClient.get(`/services/${slug}`).then((res) => res?.data),
  createLead: (payload) => axiosClient.post('/leads', payload).then((res) => res?.data),
}
