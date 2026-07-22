import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('losa_access_token')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
        const authType = localStorage.getItem('losa_auth_type')
        localStorage.removeItem('losa_access_token')
        localStorage.removeItem('losa_refresh_token')
        localStorage.removeItem('losa_user')
        localStorage.removeItem('losa_auth_type')
        window.location.href = authType === 'admin' ? '/admin/dang-nhap' : '/dang-nhap'
        return Promise.reject(error.response?.data || error)
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token
          return axiosClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('losa_refresh_token')
      const authType = localStorage.getItem('losa_auth_type')
      const loginUrl = authType === 'admin' ? '/admin/dang-nhap' : '/dang-nhap'

      if (!refreshToken) {
        isRefreshing = false
        localStorage.removeItem('losa_access_token')
        localStorage.removeItem('losa_refresh_token')
        localStorage.removeItem('losa_user')
        localStorage.removeItem('losa_auth_type')
        window.location.href = loginUrl
        return Promise.reject(error.response?.data || error)
      }

      try {
        const refreshUrl = authType === 'admin' ? '/admin/auth/refresh' : '/auth/refresh'
        
        const { data } = await axios.post(`${API_BASE_URL}${refreshUrl}`, { refreshToken })
        
        if (data && data.success) {
          const newAccessToken = data.data.accessToken
          const newRefreshToken = data.data.refreshToken
          
          localStorage.setItem('losa_access_token', newAccessToken)
          localStorage.setItem('losa_refresh_token', newRefreshToken)
          
          originalRequest.headers.Authorization = 'Bearer ' + newAccessToken
          
          processQueue(null, newAccessToken)
          
          return axiosClient(originalRequest)
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('losa_access_token')
        localStorage.removeItem('losa_refresh_token')
        localStorage.removeItem('losa_user')
        localStorage.removeItem('losa_auth_type')
        window.location.href = loginUrl
        return Promise.reject(refreshError.response?.data || refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error.response?.data || error)
  }
)

export default axiosClient
