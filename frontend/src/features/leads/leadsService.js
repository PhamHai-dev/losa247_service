import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

export const leadsService = {
  getLeads: (params) => axiosClient.get('/admin/leads', { params }).then(toList),
  getLeadStats: () => axiosClient.get('/admin/leads/stats').then((res) => res?.data),
  createLead: (payload) => axiosClient.post('/admin/leads', payload).then((res) => res?.data),
  createPublicLead: (payload) => axiosClient.post('/leads', payload).then((res) => res?.data),
  getLeadById: (id) => axiosClient.get(`/admin/leads/${id}`).then((res) => res?.data),
  updateLead: (id, payload) => axiosClient.patch(`/admin/leads/${id}`, payload).then((res) => res?.data),
  deleteLead: (id) => axiosClient.delete(`/admin/leads/${id}`).then((res) => res?.data),
  bulkUpdateLeads: (ids, data) => axiosClient.patch('/admin/leads/bulk/update', { ids, data }).then((res) => res?.data),
  bulkDeleteLeads: (ids) => axiosClient.post('/admin/leads/bulk/delete', { ids }).then((res) => res?.data),
  sendBulkEmail: (ids, subject, content) => axiosClient.post('/admin/leads/bulk/email', { ids, subject, content }).then((res) => res?.data),
  addNote: (id, content) => axiosClient.post(`/admin/leads/${id}/notes`, { content }).then((res) => res?.data),
  exportLeads: (params) => axiosClient.get('/admin/leads/export', { params, responseType: 'blob' }),
}

