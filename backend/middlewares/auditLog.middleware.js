const { logRepository } = require('../repositories/core/systemRepository');

const auditLogMiddleware = async (req, res, next) => {
  if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) return next();
  res.on('finish', async () => {
    if (res.statusCode < 200 || res.statusCode >= 300 || !req.user?._id) return;
    try {
      const actionMap = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' };
      const parts = req.baseUrl.split('/');
      const moduleName = parts.length > 0 ? parts[parts.length - 1].toUpperCase() : 'UNKNOWN';
      const sensitiveKeys = /password|token|authorization|cookie|secret|api[-_]?key/i;
      const redact = (value) => {
        if (Array.isArray(value)) return value.map(redact);
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sensitiveKeys.test(key) ? '[REDACTED]' : redact(item)]));
        return value;
      };
      let payload = redact({ ...req.body });
      if (JSON.stringify(payload).length > 5000) payload = { _truncated: true, message: 'Payload too large to log' };
      await logRepository.create({
        actor: req.user._id,
        action: actionMap[req.method] || req.method,
        module: moduleName,
        ip: req.ip,
        payload: Object.keys(payload).length > 0 ? payload : undefined,
      });
    } catch (error) { console.error('[Audit Log Error]', error); }
  });
  next();
};

module.exports = auditLogMiddleware;
