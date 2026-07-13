import axiosClient from '../../services/axiosClient'

// CLIENT — giỏ hàng server-side (yêu cầu đăng nhập client).
export const cartService = {
  getCart: () => axiosClient.get('/cart').then((res) => res?.data || []),
  // payload: { serviceId?, storeProductId?, qty }
  addItem: (payload) => axiosClient.post('/cart/items', payload).then((res) => res?.data),
  updateItem: (id, qty) => axiosClient.patch(`/cart/items/${id}`, { qty }).then((res) => res?.data),
  removeItem: (id) => axiosClient.delete(`/cart/items/${id}`),
}
