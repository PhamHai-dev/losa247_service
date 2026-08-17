const crypto = require('crypto');
const env = require('../../config/env');

const sign = (rawBody, timestamp, secret = env.N8N_OUTBOUND_SECRET || env.N8N_WEBHOOK_SECRET) => crypto.createHmac('sha256', secret).update(`${timestamp}${rawBody}`).digest('hex');

const verify = ({ rawBody, timestamp, signature, secret = env.N8N_INBOUND_SECRET || env.N8N_WEBHOOK_SECRET }) => {
  if (!secret || !timestamp || !signature || !/^\d+$/.test(String(timestamp))) return false;
  const time = Number(timestamp) < 1e12 ? Number(timestamp) * 1000 : Number(timestamp);
  if (Math.abs(Date.now() - time) > env.N8N_REPLAY_WINDOW_MS) return false;
  const expected = sign(rawBody, timestamp, secret);
  const supplied = String(signature).replace(/^sha256=/, '');
  if (supplied.length !== expected.length || !/^[a-f0-9]+$/i.test(supplied)) return false;
  return crypto.timingSafeEqual(Buffer.from(supplied, 'hex'), Buffer.from(expected, 'hex'));
};

module.exports = { sign, verify };
