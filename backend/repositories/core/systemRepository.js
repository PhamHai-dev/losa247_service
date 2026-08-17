const { prisma } = require('../../config/prisma');
const { createEntityId } = require('./entityId');
const { toLegacyEntity } = require('./legacyMapper');

const apiConfigRepository = {
  async list(provider) {
    return (await prisma.apiConfig.findMany({ where: provider ? { provider } : undefined })).map(
      toLegacyEntity,
    );
  },
  async find(provider) {
    return toLegacyEntity(await prisma.apiConfig.findUnique({ where: { provider } }));
  },
  async upsert(provider, changes) {
    const update = {};
    if (changes.apiKey) update.apiKey = changes.apiKey;
    if (changes.extra !== undefined) update.extra = changes.extra;
    if (changes.isActive !== undefined) update.isActive = changes.isActive;
    return toLegacyEntity(
      await prisma.apiConfig.upsert({
        where: { provider },
        create: { id: createEntityId(), provider, ...update },
        update,
      }),
    );
  },
};

const logRepository = {
  async create({ actor, action, module, ip, payload }) {
    return toLegacyEntity(
      await prisma.log.create({
        data: {
          id: createEntityId(),
          actorId: actor || null,
          action,
          module,
          ip: ip || null,
          payload: payload || undefined,
        },
      }),
    );
  },
};

module.exports = { apiConfigRepository, logRepository };
