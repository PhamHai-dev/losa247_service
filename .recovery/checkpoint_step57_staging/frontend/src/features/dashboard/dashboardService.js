import axiosClient from '../../services/axiosClient'

// Backend: GET /admin/dashboard/*  — trả { success, data }
export const dashboardService = {
  getKpis: () => axiosClient.get('/admin/dashboard/kpis'),
  getLeadsChart: (range = '30d') => axiosClient.get('/admin/dashboard/leads-chart', { params: { range } }),
  getLeadStatus: () => axiosClient.get('/admin/dashboard/lead-status'),
  getRecentLeads: () => axiosClient.get('/admin/dashboard/recent-leads'),
  getPopularContent: () => axiosClient.get('/admin/dashboard/popular-content'),
}
