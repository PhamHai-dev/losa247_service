import axiosClient from '../../services/axiosClient'

// ADMIN auth
export const adminLogin = (payload) => axiosClient.post('/admin/auth/login', payload)
export const adminGetMe = () => axiosClient.get('/admin/auth/me')
// ⚠️ Backend CHƯA có /admin/auth/refresh & /admin/auth/logout — xem API_ADDITIONS.md.
export const adminRefresh = (refreshToken) => axiosClient.post('/admin/auth/refresh', { refreshToken })
export const adminLogout = () => axiosClient.post('/admin/auth/logout')

// CLIENT auth
export const clientRegister = (payload) => axiosClient.post('/auth/register', payload)
export const clientLogin = (payload) => axiosClient.post('/auth/login', payload)
export const clientGetMe = () => axiosClient.get('/auth/me')
// ⚠️ Backend CHƯA có các route dưới đây — xem API_ADDITIONS.md.
export const clientRefresh = (refreshToken) => axiosClient.post('/auth/refresh', { refreshToken })
export const clientLogout = () => axiosClient.post('/auth/logout')
export const clientForgotPassword = (email) => axiosClient.post('/auth/forgot-password', { email })
export const clientResetPassword = (payload) => axiosClient.post('/auth/reset-password', payload)
