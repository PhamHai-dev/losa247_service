import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

// ADMIN
export const storeProductsService = {
  getStoreProducts: (params) => axiosClient.get('/admin/store-products', { params }).then(toList),
  createProduct: (payload) => axiosClient.post('/admin/store-products', payload).then((res) => res?.data),
  updateProduct: (id, payload) => axiosClient.put(`/admin/store-products/${id}`, payload).then((res) => res?.data),
  deleteProduct: (id) => axiosClient.delete(`/admin/store-products/${id}`),
}

// CLIENT (public) — backend dùng /:id cho chi tiết (không phải /:slug).
export const publicStoreProductsService = {
  getList: (params) => axiosClient.get('/store-products', { params }).then(toList),
  getById: (id) => axiosClient.get(`/store-products/${id}`).then((res) => res?.data),
}
