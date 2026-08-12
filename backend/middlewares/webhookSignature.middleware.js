const crypto = require('crypto');
const env = require('../config/env');
const seen = new Map();
module.exports = (req, res, next) => {
  if (!env.N8N_WEBHOOK_SECRET) return res.status(503).json({ success: false, error: { code: 'WEBHOOK_DISABLED', message: 'Webhook chưa được cấu hình' } });
  const timestamp = req.get('x-webhook-timestamp'); const signature = req.get('x-webhook-signature');
  if (!timestamp || !signature || !/^\d+$/.test(timestamp) || Math.abs(Date.now() - Number(timestamp)) > 5 * 60 * 1000) return res.status(401).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature không hợp lệ' } });
  const raw = req.rawBody || JSON.stringify(req.body || {}); const expected = crypto.createHmac('sha256', env.N8N_WEBHOOK_SECRET).update(`${timestamp}.${raw}`).digest('hex');
  const supplied = signature.replace(/^sha256=/, '');
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)) || seen.has(signature)) return res.status(401).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature không hợp lệ' } });
  seen.set(signature, Date.now()); setTimeout(() => seen.delete(signature), 5 * 60 * 1000).unref(); return next();
};
