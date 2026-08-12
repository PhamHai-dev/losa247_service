import axios from 'axios'
import { getAccessToken, setAccessToken, clearLegacyTokens } from './authSession'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
clearLegacyTokens()
const axiosClient = axios.create({ baseURL: API_BASE_URL, timeout: 20000, withCredentials: true, headers: { 'Content-Type': 'application/json' } })
axiosClient.interceptors.request.use((config) => { const value=getAccessToken(); if(value) config.headers.Authorization=`Bearer ${value}`; return config })
let refreshPromise = null
const clearSession = () => { setAccessToken(''); localStorage.removeItem('losa_user'); localStorage.removeItem('losa_auth_type') }
axiosClient.interceptors.response.use((response)=>response.data, async(error)=>{ const request=error.config||{}; if(error.response?.status!==401||request._retry||String(request.url).includes('/auth/login')||String(request.url).includes('/auth/refresh')) return Promise.reject(error.response?.data||error); request._retry=true; const type=localStorage.getItem('losa_auth_type'); if(!type){clearSession();return Promise.reject(error.response?.data||error)}; try { if(!refreshPromise){const path=type==='admin'?'/admin/auth/refresh':'/auth/refresh';refreshPromise=axios.post(`${API_BASE_URL}${path}`,{}, {withCredentials:true}).finally(()=>{refreshPromise=null})} const response=await refreshPromise; const fresh=response.data?.data?.accessToken; if(!fresh)throw new Error('Refresh failed'); setAccessToken(fresh); if(response.data.data.user)localStorage.setItem('losa_user',JSON.stringify(response.data.data.user)); request.headers=request.headers||{};request.headers.Authorization=`Bearer ${fresh}`;return axiosClient(request); }catch(refreshError){clearSession();return Promise.reject(refreshError.response?.data||refreshError)} })
export default axiosClient
