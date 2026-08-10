import axiosClient from '../../services/axiosClient'

export const settingsService = {
  getAppearance: () => axiosClient.get('/admin/settings/appearance').then((res) => res?.data),
  updateAppearance: (payload) => axiosClient.put('/admin/settings/appearance', payload).then((res) => res?.data),
  getSiteInfo: () => axiosClient.get('/admin/settings/site-info').then((res) => res?.data),
  getPublicSiteInfo: () => axiosClient.get('/settings/site-info').then((res) => res?.data),
  updateSiteInfo: (payload) => axiosClient.put('/admin/settings/site-info', payload).then((res) => res?.data),
  // Upload asset dạng multipart: nhận File, trả url.
  uploadAsset: (file) => {
    const form = new FormData()
    form.append('file', file)
    return axiosClient
      .post('/admin/settings/upload-asset', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res?.data)
  },
}

export const apiConfigsService = {
  getConfigs: () => axiosClient.get('/admin/api-configs').then((res) => res?.data || []),
  updateConfig: (provider, payload) => axiosClient.put(`/admin/api-configs/${provider}`, payload).then((res) => res?.data),
  testConnection: (provider) => axiosClient.post(`/admin/api-configs/${provider}/test`).then((res) => res?.data),
}
