const cron = require('node-cron');
const CartItem = require('../models/CartItem.model');
const n8nHelper = require('../helpers/n8n');

const initAbandonedCartJob = () => {
  // Chạy vào 9h sáng mỗi ngày
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Đang quét giỏ hàng treo...');
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const abandonedCarts = await CartItem.find({
        addedAt: { $lte: oneDayAgo },
        remindedAt: { $exists: false }
      });

      for (const cart of abandonedCarts) {
        try {
          await n8nHelper.sendCartReminder(cart);
          cart.remindedAt = new Date();
          await cart.save();
        } catch (err) {
          console.error(`[CRON] Lỗi nhắc nhở giỏ hàng ${cart._id}:`, err);
        }
      }
      console.log(`[CRON] Đã quét và nhắc nhở ${abandonedCarts.length} giỏ hàng treo.`);
    } catch (err) {
      console.error('[CRON] Lỗi job abandoned cart:', err);
    }
  });
};

module.exports = initAbandonedCartJob;
