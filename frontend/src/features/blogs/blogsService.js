import axiosClient from '../../services/axiosClient'

const toList = (res) => ({ items: res?.data || [], pagination: res?.pagination || null })

// ADMIN
export const blogsService = {
  getStats: () => axiosClient.get('/admin/blogs/stats').then(res => res?.data),
  getBlogs: (params) => axiosClient.get('/admin/blogs', { params }).then(toList),
  createBlog: (payload) => axiosClient.post('/admin/blogs', payload).then((res) => res?.data),
  updateBlog: (id, payload) => axiosClient.put(`/admin/blogs/${id}`, payload).then((res) => res?.data),
  deleteBlog: (id) => axiosClient.delete(`/admin/blogs/${id}`),
  approve: (id) => axiosClient.patch(`/admin/blogs/${id}/approve`).then((res) => res?.data),
  reject: (id) => axiosClient.patch(`/admin/blogs/${id}/reject`).then((res) => res?.data),
}

// ADMIN — danh mục blog. Backend path thực tế: /admin/blogs/categories
export const blogCategoriesService = {
  getCategories: () => axiosClient.get('/admin/blogs/categories').then(toList),
  createCategory: (payload) => axiosClient.post('/admin/blogs/categories', payload).then((res) => res?.data),
  updateCategory: (id, payload) => axiosClient.put(`/admin/blogs/categories/${id}`, payload).then((res) => res?.data),
  deleteCategory: (id) => axiosClient.delete(`/admin/blogs/categories/${id}`),
}

export const blogTagsService = {
  getTags: (params) => axiosClient.get('/admin/blogs/tags', { params }).then(toList),
  createTag: (payload) => axiosClient.post('/admin/blogs/tags', payload).then((res) => res?.data),
  updateTag: (id, payload) => axiosClient.put(`/admin/blogs/tags/${id}`, payload).then((res) => res?.data),
  deleteTag: (id) => axiosClient.delete(`/admin/blogs/tags/${id}`),
}

// CLIENT (public)
export const publicBlogsService = {
  getList: (params) => axiosClient.get('/blogs', { params }).then(toList),
  getCategories: () => axiosClient.get('/blogs/categories').then((res) => res?.data || []),
  getTags: (params) => axiosClient.get('/blogs/tags', { params }).then((res) => res?.data || []),
  getBySlug: (slug) => axiosClient.get(`/blogs/${slug}`).then((res) => res?.data),
  getRelated: (slug) => axiosClient.get(`/blogs/${slug}/related`).then((res) => res?.data || []),
  recordView: (slug) => axiosClient.post(`/blogs/${slug}/view`),
}
