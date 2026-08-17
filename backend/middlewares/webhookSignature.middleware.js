const env = require('../config/env');
const { verify } = require('../services/chat/webhookSecurityService');

module.exports = (req, res, next) => {
  if (!env.N8N_INBOUND_SECRET) return res.status(503).json({ success: false, error: { code: 'WEBHOOK_DISABLED', message: 'Webhook chưa được cấu hình' } });
  const timestamp = req.get('x-timestamp') || req.get('x-webhook-timestamp');
  const signature = req.get('x-signature') || req.get('x-webhook-signature');
  const rawBody = req.rawBody || JSON.stringify(req.body || {});
  if (!verify({ rawBody, timestamp, signature })) return res.status(401).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature không hợp lệ' } });
  return next();
};

