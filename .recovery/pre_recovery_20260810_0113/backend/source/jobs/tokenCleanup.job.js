const cron = require('node-cron');

const initTokenCleanupJob = () => {
  // Chạy vào 2h sáng mỗi Chủ Nhật
  cron.schedule('0 2 * * 0', async () => {
    console.log('[CRON] Đang dọn dẹp token cũ...');
    // Nếu có sử dụng database để lưu JWT Blacklist/Whitelist thì thực hiện xoá tại đây
    console.log('[CRON] Dọn dẹp hoàn tất.');
  });
};

module.exports = initTokenCleanupJob;
