import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

export const ordersService = {
  getOrders: (params) => axiosClient.get('/admin/orders', { params }).then(toList),
  getOrderById: (id) => axiosClient.get(`/admin/orders/${id}`).then((res) => res?.data),
  updateStatus: (id, status) => axiosClient.patch(`/admin/orders/${id}/status`, { status }).then((res) => res?.data),
  confirmPayment: (id) => axiosClient.post(`/admin/orders/${id}/confirm-payment`).then((res) => res?.data),
  activate: (id) => axiosClient.post(`/admin/orders/${id}/activate`).then((res) => res?.data),
  cancel: (id, reason) => axiosClient.post(`/admin/orders/${id}/cancel`, { reason }).then((res) => res?.data),
}

export const clientOrdersService = {
  getMyOrders: () => axiosClient.get('/orders').then((res) => res?.data),
}
