const crypto = require('crypto');
const env = require('../../config/env');

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const secretFor = (scope) => scope === 'admin' ? env.JWT_ADMIN_SECRET : env.JWT_CLIENT_SECRET;

const createSessionToken = () => crypto.randomBytes(32).toString('base64url');
const hashSessionToken = (token) => crypto.createHash('sha256').update(String(token || '')).digest('hex');
const matchesSessionToken = (token, hash) => {
  if (!token || !hash) return false;
  const actual = Buffer.from(hashSessionToken(token), 'hex');
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

const createStreamTicket = ({ principalId, scope = 'admin' }) => {
  const payload = encode({ principalId, scope, exp: Date.now() + env.SSE_TICKET_TTL_SECONDS * 1000, nonce: crypto.randomUUID() });
  const signature = crypto.createHmac('sha256', secretFor(scope)).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const verifyStreamTicket = (ticket, expectedScope = 'admin') => {
  const [payload, signature] = String(ticket || '').split('.');
  if (!payload || !signature) return null;
  const expected = crypto.createHmac('sha256', secretFor(expectedScope)).update(payload).digest('base64url');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.scope === expectedScope && decoded.exp > Date.now() ? decoded : null;
  } catch { return null; }
};

module.exports = { createSessionToken, hashSessionToken, matchesSessionToken, createStreamTicket, verifyStreamTicket };
