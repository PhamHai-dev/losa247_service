import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

export const usersService = {
  getUsers: (params) => axiosClient.get('/admin/users', { params }).then(toList),
  createUser: (payload) => axiosClient.post('/admin/users', payload).then((res) => res?.data),
  updateUser: (id, payload) => axiosClient.patch(`/admin/users/${id}`, payload).then((res) => res?.data),
}

// ⚠️ Backend CHƯA có route /admin/roles/permissions — xem API_ADDITIONS.md.
export const rolesService = {
  updatePermissions: (matrix) => axiosClient.put('/admin/roles/permissions', { matrix }).then((res) => res?.data),
}
