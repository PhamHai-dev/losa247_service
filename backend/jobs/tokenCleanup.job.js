const cron = require('node-cron');
const { sessionRepository } = require('../repositories/core/identityRepository');

const initTokenCleanupJob = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      const result = await sessionRepository.cleanup();
      console.log(`[CRON] Đã dọn ${result.count} refresh session hết hạn.`);
    } catch (error) { console.error('[CRON] Không thể dọn refresh session:', error); }
  });
};

module.exports = initTokenCleanupJob;
