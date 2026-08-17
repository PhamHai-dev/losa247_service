const crypto = require('crypto');

/**
 * Generates the 24-character hexadecimal ID used by MySQL entities.
 * The fixed shape keeps identifiers stable across database and API layers.
 */
const createEntityId = () => crypto.randomBytes(12).toString('hex');

const isEntityId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

module.exports = { createEntityId, isEntityId };
