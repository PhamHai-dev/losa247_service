import axiosClient from '../../services/axiosClient'

// Backend: GET /admin/dashboard/*  — trả { success, data }
export const dashboardService = {
  getKpis: () => axiosClient.get('/admin/dashboard/kpis'),
  getRevenueChart: (range = '30d') => axiosClient.get('/admin/dashboard/revenue-chart', { params: { range } }),
  getLeadSources: () => axiosClient.get('/admin/dashboard/lead-sources'),
}
