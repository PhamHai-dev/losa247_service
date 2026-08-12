const env = require('../config/env');
const ApiConfig = require('../models/ApiConfig.model');

const getN8nConfig = async () => {
  const config = await ApiConfig.findOne({ provider: 'n8n' });
  if (config) {
    if (!config.isActive) return null;
    return { webhookUrl: config.extra?.webhookUrl, apiKey: config.apiKey };
  }
  return { webhookUrl: env.N8N_WEBHOOK_URL, apiKey: null };
};

// Gửi request bằng fetch (Node 18+)
const sendToN8n = async (event, payload) => {
  try {
    const config = await getN8nConfig();
    if (!config) {
      console.warn('[WARNING] N8N đang tắt');
      return false;
    }
    const { webhookUrl, apiKey } = config;
    if (!webhookUrl || webhookUrl === 'your_n8n_webhook_url_here') {
      console.warn('[WARNING] N8N Webhook URL chưa được cấu hình');
      return false;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event,
        data: payload,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`N8n responded with status: ${response.status}`);
    }

    // N8n có thể không trả về JSON, nên dùng text
    const textData = await response.text();
    try {
      return JSON.parse(textData);
    } catch {
      return textData;
    }
  } catch (error) {
    console.error(`[ERROR] Lỗi khi gọi n8n webhook (event: ${event}):`, error.message);
    throw new Error('Không thể kết nối đến n8n: ' + error.message);
  }
};

exports.triggerActivation = async (order) => {
  return await sendToN8n('order_activated', { orderId: order._id, items: order.items, customer: order.customer });
};

exports.sendCartReminder = async (cartItem) => {
  return await sendToN8n('cart_abandoned', { cartItemId: cartItem._id, customerInfo: cartItem.userId }); // Thực tế có thể populate thông tin user
};

exports.forwardChatMessage = async (sessionId, message) => {
  return await sendToN8n('chat_message', { sessionId, content: message.content, sender: message.sender });
};
