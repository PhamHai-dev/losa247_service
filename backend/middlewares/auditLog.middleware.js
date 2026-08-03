const Log = require('../models/Log.model');

const auditLogMiddleware = async (req, res, next) => {
  // Chỉ ghi log cho các hành động làm thay đổi dữ liệu
  if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) {
    return next();
  }

  // Hook vào sự kiện 'finish' của response để biết request đã hoàn thành chưa
  res.on('finish', async () => {
    // Chỉ ghi log nếu API thành công
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (req.user && req.user._id) {
        try {
          const actionMap = {
            'POST': 'CREATE',
            'PUT': 'UPDATE',
            'PATCH': 'UPDATE',
            'DELETE': 'DELETE',
          };
          
          // Lấy module từ baseUrl, ví dụ: /api/v1/admin/leads -> LEADS
          const parts = req.baseUrl.split('/');
          const moduleName = parts.length > 0 ? parts[parts.length - 1].toUpperCase() : 'UNKNOWN';
          
          let payload = { ...req.body };
          
          // Loại bỏ các thông tin nhạy cảm
          if (payload.password) delete payload.password;
          if (payload.newPassword) delete payload.newPassword;

          // Giới hạn kích thước payload (tránh lưu data base64 lớn hoặc quá nhiều thông tin)
          let payloadStr = JSON.stringify(payload);
          if (payloadStr && payloadStr.length > 5000) {
            payload = { _truncated: true, message: 'Payload too large to log' };
          }

          const log = new Log({
            actor: req.user._id,
            action: actionMap[req.method] || req.method,
            module: moduleName,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            payload: Object.keys(payload).length > 0 ? payload : undefined,
          });
          
          await log.save();
        } catch (error) {
          console.error('[Audit Log Error]', error);
        }
      }
    }
  });

  next();
};

module.exports = auditLogMiddleware;
