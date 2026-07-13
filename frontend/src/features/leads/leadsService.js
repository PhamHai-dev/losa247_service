import axiosClient from '../../services/axiosClient'

// Chuẩn hoá response list backend: { success, data: [...], pagination }
const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

export const leadsService = {
  getLeads: (params) => axiosClient.get('/admin/leads', { params }).then(toList),
  getLeadById: (id) => axiosClient.get(`/admin/leads/${id}`).then((res) => res?.data),
  updateLead: (id, payload) => axiosClient.patch(`/admin/leads/${id}`, payload).then((res) => res?.data),
  addNote: (id, note) => axiosClient.post(`/admin/leads/${id}/notes`, { note }).then((res) => res?.data),
  convertToOrder: (id) => axiosClient.post(`/admin/leads/${id}/convert-to-order`).then((res) => res?.data),
  // Export trả blob (responseType blob -> interceptor trả thẳng blob).
  exportLeads: (params) => axiosClient.get('/admin/leads/export', { params, responseType: 'blob' }),
}
