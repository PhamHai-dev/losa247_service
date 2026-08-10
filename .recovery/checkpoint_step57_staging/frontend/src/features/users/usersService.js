import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

export const usersService = {
  getUsers: (params) => axiosClient.get('/admin/users', { params }).then(toList),
  createUser: (payload) => axiosClient.post('/admin/users', payload).then((res) => res?.data),
  updateUser: (id, payload) => axiosClient.patch(`/admin/users/${id}`, payload).then((res) => res?.data),
}

export const rolesService = {
  getPermissionCatalog: () => axiosClient.get('/admin/roles/permissions').then((res) => res?.data),
  bulkUpdatePermissions: (roles) => axiosClient.put('/admin/roles/permissions/bulk', { roles }).then((res) => res?.data),
  getRoles: () => axiosClient.get('/admin/roles').then((res) => res?.data),
  createRole: (payload) => axiosClient.post('/admin/roles', payload).then((res) => res?.data),
  updateRole: (id, payload) => axiosClient.put(`/admin/roles/${id}`, payload).then((res) => res?.data),
  deleteRole: (id) => axiosClient.delete(`/admin/roles/${id}`).then((res) => res?.data),
}
