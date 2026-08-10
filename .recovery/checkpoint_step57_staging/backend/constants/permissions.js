const PERMISSION_GROUPS = Object.freeze({
  dashboard: ['dashboard.view'],
  leads: ['leads.view', 'leads.create', 'leads.update', 'leads.delete', 'leads.assign', 'leads.export'],
  blogs: ['blogs.view', 'blogs.create', 'blogs.update', 'blogs.delete', 'blogs.publish'],
  faqs: ['faqs.view', 'faqs.create', 'faqs.update', 'faqs.delete'],
  pricing: ['pricing.view', 'pricing.create', 'pricing.update', 'pricing.delete'],
  chat: ['chat.view', 'chat.reply', 'chat.assign'],
  users: ['users.view', 'users.create', 'users.update', 'users.lock'],
  roles: ['roles.view', 'roles.create', 'roles.update', 'roles.delete'],
  settings: ['settings.view', 'settings.update'],
  apiConfigs: ['apiConfigs.view', 'apiConfigs.update'],
  logs: ['logs.view'],
  notifications: ['notifications.view', 'notifications.update'],
});

const PERMISSIONS = Object.freeze(Object.values(PERMISSION_GROUPS).flat());
const PERMISSION_SET = new Set(PERMISSIONS);
const SYSTEM_ROLES = Object.freeze(['admin', 'customer']);

const normalizeRoleName = (name = '') => String(name).trim().toLowerCase();
const normalizePermissions = (permissions = []) => {
  if (!Array.isArray(permissions)) return [];
  return [...new Set(permissions.map((permission) => String(permission).trim()).filter(Boolean))];
};
const isValidPermission = (permission) => permission === '*' || PERMISSION_SET.has(permission);

module.exports = {
  PERMISSION_GROUPS,
  PERMISSIONS,
  SYSTEM_ROLES,
  normalizeRoleName,
  normalizePermissions,
  isValidPermission,
};
