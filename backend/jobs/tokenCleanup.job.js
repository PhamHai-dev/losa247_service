const cron = require('node-cron');
const User = require('../models/User.model');

const initTokenCleanupJob = () => {
  // Chạy hằng ngày lúc 02:00 và loại session đã hết hạn khỏi mọi tài khoản.
  cron.schedule('0 2 * * *', async () => {
    try {
      const result = await User.updateMany({}, { $pull: { refreshSessions: { expiresAt: { $lte: new Date() } } } });
      console.log(`[CRON] Đã dọn refresh session hết hạn trên ${result.modifiedCount} tài khoản.`);
    } catch (error) {
      console.error('[CRON] Không thể dọn refresh session:', error);
    }
  });
};

module.exports = initTokenCleanupJob;
