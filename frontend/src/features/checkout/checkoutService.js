import axiosClient from '../../services/axiosClient'

// CLIENT — tạo đơn từ giỏ hàng server-side.
// payload: { customerName, customerPhone, customerEmail?, paymentMethod? }
export const checkoutService = {
  createOrder: (payload) => axiosClient.post('/orders', payload).then((res) => res?.data),
  getOrder: (id) => axiosClient.get(`/orders/${id}`).then((res) => res?.data),
  // ⚠️ Backend CHƯA có route /orders/:id/payment-callback — xem API_ADDITIONS.md.
  paymentCallback: (id, payload) => axiosClient.post(`/orders/${id}/payment-callback`, payload).then((res) => res?.data),
}
