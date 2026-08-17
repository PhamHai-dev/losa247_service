import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

// ⚠️ Backend CHƯA có route /admin/logs — xem API_ADDITIONS.md.
export const logsService = {
  getLogs: (params) => axiosClient.get('/admin/logs', { params }).then(toList),
  exportLogs: (params) => axiosClient.get('/admin/logs/export', { params, responseType: 'blob' }),
}
