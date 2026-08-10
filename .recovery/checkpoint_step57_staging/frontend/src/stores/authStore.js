import { create } from 'zustand'
import {
  adminLogin,
  adminGetMe,
  adminLogout,
  clientLogin,
  clientRegister,
  clientGetMe,
  clientLogout,
} from '../features/auth/authService'

const savedAccessToken = localStorage.getItem('losa_access_token')
const savedRefreshToken = localStorage.getItem('losa_refresh_token')
const savedUser = localStorage.getItem('losa_user')
const savedAuthType = localStorage.getItem('losa_auth_type')

export const useAuthStore = create((set, get) => ({
  accessToken: savedAccessToken || '',
  refreshToken: savedRefreshToken || '',
  user: savedUser ? JSON.parse(savedUser) : null,
  authType: savedAuthType || '',
  loading: false,
  error: '',

  loginAdmin: async (payload) => {
    set({ loading: true, error: '' })

    try {
      const response = await adminLogin(payload)
      const data = response.data

      localStorage.setItem('losa_access_token', data.accessToken)
      localStorage.setItem('losa_refresh_token', data.refreshToken)
      localStorage.setItem('losa_user', JSON.stringify(data.user))
      localStorage.setItem('losa_auth_type', 'admin')

      set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
        authType: 'admin',
        loading: false,
      })

      return data
    } catch (error) {
      const message = error?.error?.message || 'Đăng nhập admin thất bại'
      set({ error: message, loading: false })
      throw error
    }
  },

  loginClient: async (payload) => {
    set({ loading: true, error: '' })

    try {
      const response = await clientLogin(payload)
      const data = response.data

      localStorage.setItem('losa_access_token', data.accessToken)
      localStorage.setItem('losa_refresh_token', data.refreshToken || '')
      localStorage.setItem('losa_user', JSON.stringify(data.user))
      localStorage.setItem('losa_auth_type', 'client')

      set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || '',
        user: data.user,
        authType: 'client',
        loading: false,
      })

      return data
    } catch (error) {
      const message = error?.error?.message || 'Đăng nhập khách hàng thất bại'
      set({ error: message, loading: false })
      throw error
    }
  },

  registerClient: async (payload) => {
    set({ loading: true, error: '' })

    try {
      const response = await clientRegister(payload)
      set({ loading: false })
      return response.data
    } catch (error) {
      const message = error?.error?.message || 'Đăng ký thất bại'
      set({ error: message, loading: false })
      throw error
    }
  },

  loadMe: async () => {
    const authType = get().authType

    if (!get().accessToken || !authType) return null
    set({ loading: true })
    try {
      const response = authType === 'admin' ? await adminGetMe() : await clientGetMe()
      set({ user: response.data, loading: false })
      localStorage.setItem('losa_user', JSON.stringify(response.data))
      return response.data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: async () => {
    // Gọi server logout best-effort (bỏ qua nếu backend chưa có endpoint).
    try {
      const authType = get().authType
      if (authType === 'admin') await adminLogout()
      else if (authType === 'client') await clientLogout()
    } catch {
      // ignore
    }

    localStorage.removeItem('losa_access_token')
    localStorage.removeItem('losa_refresh_token')
    localStorage.removeItem('losa_user')
    localStorage.removeItem('losa_auth_type')

    set({
      accessToken: '',
      refreshToken: '',
      user: null,
      authType: '',
      error: '',
      loading: false,
    })
  },

  hasPermission: (perm) => {
    const permissions = get().user?.permissions
    return Array.isArray(permissions) && (permissions.includes('*') || permissions.includes(perm))
  },
  hasAnyPermission: (perms = []) => perms.some((perm) => get().hasPermission(perm)),
  hasAllPermissions: (perms = []) => perms.every((perm) => get().hasPermission(perm)),
}))
