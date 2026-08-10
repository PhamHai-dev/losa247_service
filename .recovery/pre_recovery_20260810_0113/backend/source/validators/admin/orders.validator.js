const { z } = require('zod');

exports.updateStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'active', 'completed', 'cancelled']),
});

exports.cancelOrderSchema = z.object({
  reason: z.string().min(1, 'Vui lòng cung cấp lý do huỷ đơn'),
});
