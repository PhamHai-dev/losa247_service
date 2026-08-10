const env = require('../config/env');
const ApiConfig = require('../models/ApiConfig.model');

// Helper nội bộ để lấy webhook URL
const getN8nWebhookUrl = async () => {
  const config = await ApiConfig.findOne({ provider: 'n8n', isActive: true });
  if (config && config.extra && config.extra.webhookUrl) {
    return config.extra.webhookUrl;
  }
  return env.N8N_WEBHOOK_URL;
};

// Gửi request bằng fetch (Node 18+)
const sendToN8n = async (event, payload) => {
  try {
    const webhookUrl = await getN8nWebhookUrl();
    if (!webhookUrl || webhookUrl === 'your_n8n_webhook_url_here') {
      console.warn('[WARNING] N8N Webhook URL chưa được cấu hình');
      return false;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
