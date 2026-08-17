const { prisma } = require('../../config/prisma');
const { createEntityId } = require('./entityId');
const { toLegacyRole, toLegacyUser } = require('./legacyMapper');

const roleRepository = {
  async list() {
    return (await prisma.role.findMany({ orderBy: { createdAt: 'asc' } })).map(toLegacyRole);
  },
  async findById(id) {
    return toLegacyRole(await prisma.role.findUnique({ where: { id } }));
  },
  async findByName(name) {
    return toLegacyRole(await prisma.role.findUnique({ where: { name } }));
  },
  async existsName(name, excludeId) {
    return Boolean(
      await prisma.role.findFirst({
        where: { name, ...(excludeId ? { id: { not: excludeId } } : {}) },
        select: { id: true },
      }),
    );
  },
  async create(data) {
    return toLegacyRole(await prisma.role.create({ data: { id: createEntityId(), ...data } }));
  },
  async update(id, data) {
    return toLegacyRole(await prisma.role.update({ where: { id }, data }));
  },
  async findByIds(ids) {
    return (await prisma.role.findMany({ where: { id: { in: ids } } })).map(toLegacyRole);
  },
  async delete(id) {
    await prisma.role.delete({ where: { id } });
  },
};

const userRepository = {
  async findById(id, secrets = false) {
    return toLegacyUser(
      await prisma.user.findUnique({
        where: { id },
        ...(secrets ? { include: { refreshSessions: { orderBy: { createdAt: 'asc' } } } } : {}),
      }),
      { includeSecrets: secrets },
    );
  },
  async findByEmail(email, secrets = false) {
    return toLegacyUser(
      await prisma.user.findUnique({
        where: { email: String(email).toLowerCase() },
        ...(secrets ? { include: { refreshSessions: { orderBy: { createdAt: 'asc' } } } } : {}),
      }),
      { includeSecrets: secrets },
    );
  },
  async existsEmail(email) {
    return Boolean(
      await prisma.user.findUnique({
        where: { email: String(email).toLowerCase() },
        select: { id: true },
      }),
    );
  },
  async countByRole(roleName, status) {
    return prisma.user.count({ where: { roleName, ...(status ? { status } : {}) } });
  },
  async list({ skip, take, search, roleName, clientsOnly }) {
    const where = {
      ...(roleName
        ? { roleName }
        : clientsOnly
          ? { roleName: 'customer' }
          : { roleName: { not: 'customer' } }),
      ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    return { rows: rows.map(toLegacyUser), total };
  },
  async create(data) {
    return toLegacyUser(
      await prisma.user.create({
        data: {
          id: createEntityId(),
          name: data.name,
          email: String(data.email).toLowerCase(),
          phone: data.phone || null,
          passwordHash: data.passwordHash,
          roleName: data.role || 'customer',
        },
      }),
    );
  },
  async updateAuthorization(id, roleName, status, revokeSessions) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data: { roleName, status } });
      if (revokeSessions) await tx.refreshSession.deleteMany({ where: { userId: id } });
      return toLegacyUser(user);
    });
  },
  async roleInUse(roleName) {
    return Boolean(await prisma.user.findFirst({ where: { roleName }, select: { id: true } }));
  },
  async setResetToken(id, resetPasswordToken, resetPasswordExpires) {
    return prisma.user.update({
      where: { id },
      data: { resetPasswordToken, resetPasswordExpires },
    });
  },
  async findByResetToken(resetPasswordToken) {
    return toLegacyUser(
      await prisma.user.findFirst({
        where: { resetPasswordToken, resetPasswordExpires: { gt: new Date() } },
      }),
      { includeSecrets: true },
    );
  },
  async resetPassword(id, passwordHash) {
    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { passwordHash, resetPasswordToken: null, resetPasswordExpires: null },
      });
      await tx.refreshSession.deleteMany({ where: { userId: id } });
    });
  },
};

const sessionRepository = {
  async replaceForLogin(userId, session) {
    return prisma.$transaction(async (tx) => {
      await tx.refreshSession.deleteMany({ where: { userId, expiresAt: { lte: new Date() } } });
      await tx.refreshSession.create({ data: { userId, ...session } });
      const extras = await tx.refreshSession.findMany({
        where: { userId, audience: session.audience },
        orderBy: { createdAt: 'desc' },
        skip: 5,
        select: { id: true },
      });
      if (extras.length)
        await tx.refreshSession.deleteMany({ where: { id: { in: extras.map(({ id }) => id) } } });
    });
  },
  async findValid(userId, tokenHash, audience) {
    return prisma.refreshSession.findFirst({
      where: { userId, tokenHash, audience, expiresAt: { gt: new Date() } },
    });
  },
  async rotate(id, session) {
    return prisma.refreshSession.update({ where: { id }, data: session });
  },
  async revokeToken(userId, tokenHash) {
    return prisma.refreshSession.deleteMany({ where: { userId, tokenHash } });
  },
  async revokeFamily(userId, familyId) {
    return prisma.refreshSession.deleteMany({ where: { userId, familyId } });
  },
  async revokeUser(userId) {
    return prisma.refreshSession.deleteMany({ where: { userId } });
  },
  async cleanup() {
    return prisma.refreshSession.deleteMany({ where: { expiresAt: { lte: new Date() } } });
  },
  async revokeById(id) {
    return prisma.refreshSession.deleteMany({ where: { id } });
  },
};

module.exports = { roleRepository, userRepository, sessionRepository };
