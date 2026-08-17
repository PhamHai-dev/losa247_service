const { apiConfigRepository } = require('../../repositories/core/systemRepository');

const safe = ({ apiKey, ...config }) => ({ ...config, hasApiKey: Boolean(apiKey) });

exports.getApiConfigs = async (_req, res, next) => {
  try { res.json({ success: true, data: (await apiConfigRepository.list('n8n')).map(safe) }); }
  catch (err) { next(err); }
};

exports.updateApiConfig = async (req, res, next) => {
  try {
    const { provider } = req.params;
    if (provider !== 'n8n') return res.status(400).json({ success: false, error: { code: 'UNSUPPORTED_PROVIDER', message: 'Chỉ hỗ trợ cấu hình n8n' } });
    const config = await apiConfigRepository.upsert(provider, req.body);
    return res.json({ success: true, data: safe(config) });
  } catch (err) { return next(err); }
};

exports.testApiConfig = async (req, res, next) => {
  try {
    if (req.params.provider !== 'n8n') return res.status(400).json({ success: false, error: { code: 'UNSUPPORTED_PROVIDER', message: 'Chỉ hỗ trợ cấu hình n8n' } });
    const config = await apiConfigRepository.find('n8n');
    if (!config?.isActive) return res.status(400).json({ success: false, error: { code: 'N8N_DISABLED', message: 'n8n đang tắt' } });
    const webhookUrl = config.extra?.webhookUrl;
    if (!webhookUrl) return res.status(400).json({ success: false, error: { code: 'MISSING_WEBHOOK', message: 'Chưa cấu hình webhook URL' } });
    const headers = { 'Content-Type': 'application/json' };
    if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
    const response = await fetch(webhookUrl, { method: 'POST', headers, body: JSON.stringify({ event: 'connection_test', data: { source: 'losa247-admin' }, timestamp: new Date().toISOString() }) });
    if (!response.ok) throw new Error(`n8n phản hồi HTTP ${response.status}`);
    return res.json({ success: true, message: 'Kết nối n8n thành công.' });
  } catch (err) { return next(err); }
};
