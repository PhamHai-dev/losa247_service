const { z } = require('zod');

exports.createOrderSchema = z.object({
  customerName: z.string().min(1, 'Tên không được để trống'),
  customerPhone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  customerEmail: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  paymentMethod: z.string().optional(),
});
