import axiosClient from '../../services/axiosClient'

const toList = (res) => ({
  items: res?.data || [], pagination: res?.pagination || null,
  requestedLocale: res?.requestedLocale, resolvedLocale: res?.resolvedLocale, isFallback: Boolean(res?.isFallback),
})

// ADMIN
export const blogsService = {
  getStats: () => axiosClient.get('/admin/blogs/stats').then(res => res?.data),
  getBlogs: (params) => axiosClient.get('/admin/blogs', { params }).then(toList),
  createBlog: (payload) => axiosClient.post('/admin/blogs', payload).then((res) => res?.data),
  updateBlog: (id, payload) => axiosClient.put(`/admin/blogs/${id}`, payload).then((res) => res?.data),
  deleteBlog: (id) => axiosClient.delete(`/admin/blogs/${id}`),
  deleteTranslation: (id, locale) => axiosClient.delete(`/admin/blogs/${id}/translations/${locale}`),
  approve: (id, locale = 'vi') => axiosClient.patch(`/admin/blogs/${id}/approve`, { locale }).then((res) => res?.data),
  reject: (id, locale = 'vi') => axiosClient.patch(`/admin/blogs/${id}/reject`, { locale }).then((res) => res?.data),
  translatePreview: (source) => axiosClient.post('/admin/blogs/translate-preview', source, { timeout: 90000 }).then((res) => res?.data),
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
  getList: (params = {}, locale = 'vi') => axiosClient.get('/blogs', { params: { ...params, locale } }).then(toList),
  getCategories: (locale = 'vi') => axiosClient.get('/blogs/categories', { params: { locale } }).then((res) => res?.data || []),
  getTags: (params = {}, locale = 'vi') => axiosClient.get('/blogs/tags', { params: { ...params, locale } }).then((res) => res?.data || []),
  getBySlug: (slug, locale = 'vi') => axiosClient.get(`/blogs/${slug}`, { params: { locale } }).then((res) => res?.data),
  getRelated: (slug, locale = 'vi') => axiosClient.get(`/blogs/${slug}/related`, { params: { locale } }).then((res) => res?.data || []),
  recordView: (slug, locale = 'vi') => axiosClient.post(`/blogs/${slug}/view`, null, { params: { locale } }),
}
