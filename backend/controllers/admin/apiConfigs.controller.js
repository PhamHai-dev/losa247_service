const ApiConfig = require('../../models/ApiConfig.model');

exports.getApiConfigs = async (req, res, next) => {
  try {
    const configs = await ApiConfig.find({ provider: 'n8n' }).lean();
    const safeConfigs = configs.map(({ apiKey, ...config }) => ({ ...config, hasApiKey: Boolean(apiKey) }));
    res.json({ success: true, data: safeConfigs });
  } catch (err) {
    next(err);
  }
};

exports.updateApiConfig = async (req, res, next) => {
  try {
    const { provider } = req.params;
    if (provider !== 'n8n') return res.status(400).json({ success: false, error: { code: 'UNSUPPORTED_PROVIDER', message: 'Chỉ hỗ trợ cấu hình n8n' } });
    const { apiKey, extra, isActive } = req.body;

    let config = await ApiConfig.findOne({ provider });
    if (!config) config = new ApiConfig({ provider });
    if (apiKey) config.apiKey = apiKey;
    if (extra !== undefined) config.extra = extra;
    if (isActive !== undefined) config.isActive = isActive;

    await config.save();
    const safeConfig = config.toObject();
    const hasApiKey = Boolean(safeConfig.apiKey);
    delete safeConfig.apiKey;
    res.json({ success: true, data: { ...safeConfig, hasApiKey } });
  } catch (err) {
    next(err);
  }
};

exports.testApiConfig = async (req, res, next) => {
  try {
    if (req.params.provider !== 'n8n') return res.status(400).json({ success: false, error: { code: 'UNSUPPORTED_PROVIDER', message: 'Chỉ hỗ trợ cấu hình n8n' } });
    const config = await ApiConfig.findOne({ provider: 'n8n' });
    if (!config?.isActive) return res.status(400).json({ success: false, error: { code: 'N8N_DISABLED', message: 'n8n đang tắt' } });
    const webhookUrl = config.extra?.webhookUrl;
    if (!webhookUrl) return res.status(400).json({ success: false, error: { code: 'MISSING_WEBHOOK', message: 'Chưa cấu hình webhook URL' } });
    const headers = { 'Content-Type': 'application/json' };
    if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
    const response = await fetch(webhookUrl, { method: 'POST', headers, body: JSON.stringify({ event: 'connection_test', data: { source: 'losa247-admin' }, timestamp: new Date().toISOString() }) });
    if (!response.ok) throw new Error(`n8n phản hồi HTTP ${response.status}`);
    res.json({ success: true, message: 'Kết nối n8n thành công.' });
  } catch (err) {
    next(err);
  }
};
