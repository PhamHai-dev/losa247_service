import axiosClient from '../../services/axiosClient'

export const pricingService = {
  // Plans
  getPlans: async (params) => {
    return await axiosClient.get('/admin/pricing/plans', { params })
  },
  getPlanById: async (id) => {
    return await axiosClient.get(`/admin/pricing/plans/${id}`)
  },
  createPlan: async (data) => {
    return await axiosClient.post('/admin/pricing/plans', data)
  },
  updatePlan: async (id, data) => {
    return await axiosClient.put(`/admin/pricing/plans/${id}`, data)
  },
  deletePlan: async (id) => {
    return await axiosClient.delete(`/admin/pricing/plans/${id}`)
  },

  getStats: async () => {
    return await axiosClient.get('/admin/pricing/stats')
  },

  // Comparisons
  getComparisons: async (params) => {
    return await axiosClient.get('/admin/pricing/comparisons', { params })
  },
  getComparisonById: async (id) => {
    return await axiosClient.get(`/admin/pricing/comparisons/${id}`)
  },
  createComparison: async (data) => {
    return await axiosClient.post('/admin/pricing/comparisons', data)
  },
  updateComparison: async (id, data) => {
    return await axiosClient.put(`/admin/pricing/comparisons/${id}`, data)
  },
  deleteComparison: async (id) => {
    return await axiosClient.delete(`/admin/pricing/comparisons/${id}`)
  },
}

export const publicPricingService = {
  getPlans: async () => {
    return await axiosClient.get('/client/pricing/plans')
  },
  getComparisons: async () => {
    return await axiosClient.get('/client/pricing/comparisons')
  }
}
