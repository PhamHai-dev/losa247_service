import { create } from 'zustand'
import axios from 'axios'
import { adminLogin, adminGetMe, adminLogout, clientLogin, clientRegister, clientGetMe, clientLogout } from '../features/auth/authService'
import { setAccessToken, clearLegacyTokens } from '../services/authSession'
const API_BASE_URL=import.meta.env.VITE_API_BASE_URL||'http://localhost:5000/api/v1'
clearLegacyTokens()
const savedUser=localStorage.getItem('losa_user');const savedAuthType=localStorage.getItem('losa_auth_type')||''
const persist=(user,type)=>{if(user)localStorage.setItem('losa_user',JSON.stringify(user));else localStorage.removeItem('losa_user');if(type)localStorage.setItem('losa_auth_type',type);else localStorage.removeItem('losa_auth_type')}
export const useAuthStore=create((set,get)=>({accessToken:'',refreshToken:'',user:savedUser?JSON.parse(savedUser):null,authType:savedAuthType,loading:false,error:'',initialized:false,
 loginAdmin:async(payload)=>{set({loading:true,error:''});try{const r=await adminLogin(payload),d=r.data;setAccessToken(d.accessToken);persist(d.user,'admin');set({accessToken:d.accessToken,user:d.user,authType:'admin',loading:false,initialized:true});return d}catch(e){set({error:e?.error?.message||'Đăng nhập admin thất bại',loading:false});throw e}},
 loginClient:async(payload)=>{set({loading:true,error:''});try{const r=await clientLogin(payload),d=r.data;setAccessToken(d.accessToken);persist(d.user,'client');set({accessToken:d.accessToken,user:d.user,authType:'client',loading:false,initialized:true});return d}catch(e){set({error:e?.error?.message||'Đăng nhập khách hàng thất bại',loading:false});throw e}},
 registerClient:async(payload)=>{set({loading:true,error:''});try{const r=await clientRegister(payload);set({loading:false});return r.data}catch(e){set({error:e?.error?.message||'Đăng ký thất bại',loading:false});throw e}},
 loadMe:async()=>{const type=get().authType;if(!type){set({initialized:true});return null}try{let access=get().accessToken;if(!access){const path=type==='admin'?'/admin/auth/refresh':'/auth/refresh';const r=await axios.post(`${API_BASE_URL}${path}`,{}, {withCredentials:true});access=r.data.data.accessToken;setAccessToken(access);set({accessToken:access})}const r=type==='admin'?await adminGetMe():await clientGetMe();persist(r.data,type);set({user:r.data,initialized:true});return r.data}catch{setAccessToken('');persist(null,'');set({accessToken:'',user:null,authType:'',initialized:true});return null}},
 logout:async()=>{try{if(get().authType==='admin')await adminLogout();else if(get().authType==='client')await clientLogout()}catch{}setAccessToken('');persist(null,'');set({accessToken:'',refreshToken:'',user:null,authType:'',error:'',loading:false,initialized:true})},
 hasPermission:(perm)=>{const u=get().user;return !!u&&(u.role==='admin'||(Array.isArray(u.permissions)&&u.permissions.includes(perm)))}}))
