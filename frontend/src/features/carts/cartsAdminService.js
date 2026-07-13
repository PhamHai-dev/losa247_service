import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

export const cartsAdminService = {
  getAbandoned: (params) => axiosClient.get('/admin/carts/abandoned', { params }).then(toList),
  remind: (id) => axiosClient.post(`/admin/carts/${id}/remind`),
}
