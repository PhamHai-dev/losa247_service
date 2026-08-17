const toLegacyEntity = (record) => {
  if (!record) return null;
  const { id, roleName, ...rest } = record;
  return {
    _id: id,
    id,
    ...rest,
    ...(roleName !== undefined ? { role: roleName } : {}),
  };
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
