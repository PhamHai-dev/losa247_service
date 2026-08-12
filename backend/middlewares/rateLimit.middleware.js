const buckets = new Map();
const createRateLimit = ({ windowMs = 15 * 60 * 1000, max = 100, key = (req) => req.ip }) => (req, res, next) => {
  const now = Date.now(); const id = key(req); const current = buckets.get(id);
  const entry = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
  entry.count += 1; buckets.set(id, entry);
  res.set('RateLimit-Limit', String(max)); res.set('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
  if (entry.count > max) { res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000))); return res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' } }); }
  return next();
};
setInterval(() => { const now = Date.now(); for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k); }, 10 * 60 * 1000).unref();
const authKey = (req) => `${req.ip}:${String(req.body?.email || '').trim().toLowerCase()}`;
module.exports = { loginLimiter: createRateLimit({ max: 10, key: authKey }), refreshLimiter: createRateLimit({ max: 30 }), resetLimiter: createRateLimit({ max: 5, key: authKey }), webhookLimiter: createRateLimit({ max: 60 }) };
