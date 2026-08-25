const normalizeResponseValue = (value) => {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(normalizeResponseValue);
  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return value;
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeResponseValue(item)]));
  }
  return value;
};

const toLegacyEntity = (record) => {
  if (!record) return null;
  const { id, roleName, ...rest } = record;
  const normalizedId = normalizeResponseValue(id);
  return normalizeResponseValue({
    _id: normalizedId,
    id: normalizedId,
    ...rest,
    ...(roleName !== undefined ? { role: roleName } : {}),
  });
};

const toLegacyRole = (record) => {
  if (!record) return null;
  const role = toLegacyEntity(record);
  role.permissions = Array.isArray(role.permissions) ? role.permissions : [];
  return role;
};

const toLegacyUser = (record, { includeSecrets = false } = {}) => {
  if (!record) return null;
  const user = toLegacyEntity(record);
  if (!includeSecrets) {
    delete user.passwordHash;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    delete user.refreshSessions;
  }
  return user;
};

module.exports = { toLegacyEntity, toLegacyRole, toLegacyUser };
