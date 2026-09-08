const env = require('../config/env');
const { apiConfigRepository } = require('../repositories/core/systemRepository');

const isUsableWebhookUrl = (value) => {
  if (typeof value !== 'string' || !value.trim() || value.includes('your_n8n_webhook_url')) return false;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const getN8nConfig = async () => {
  const config = await apiConfigRepository.find('n8n');
  if (config && !config.isActive) return null;

  const storedWebhookUrl = config?.extra?.webhookUrl;
  const webhookUrl = isUsableWebhookUrl(storedWebhookUrl) ? storedWebhookUrl : env.N8N_WEBHOOK_URL;
  if (!isUsableWebhookUrl(webhookUrl)) return { webhookUrl: null, apiKey: config?.apiKey || null };

  return { webhookUrl, apiKey: config?.apiKey || null };
};

const sendToN8n = async (event, payload) => {
  try {
    const config = await getN8nConfig();
    if (!config) { console.warn('[WARNING] N8N đang tắt'); return false; }
    const { webhookUrl, apiKey } = config;
    if (!webhookUrl) { console.warn('[WARNING] N8N Webhook URL chưa được cấu hình hợp lệ'); return false; }
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const response = await fetch(webhookUrl, { method: 'POST', headers, body: JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() }) });
    if (!response.ok) throw new Error(`N8n responded with status: ${response.status}`);
    const textData = await response.text();
    try { return JSON.parse(textData); } catch { return textData; }
  } catch (error) {
    console.error(`[ERROR] Lỗi khi gọi n8n webhook (event: ${event}):`, error.message);
    throw new Error('Không thể kết nối đến n8n: ' + error.message);
  }
};

exports.getN8nConfig = getN8nConfig;
exports.isUsableWebhookUrl = isUsableWebhookUrl;
exports.forwardChatMessage = async (sessionId, message) => sendToN8n('chat_message', { sessionId, content: message.content, sender: message.sender });
