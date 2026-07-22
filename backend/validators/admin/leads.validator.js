const { z } = require('zod');

exports.createLeadSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên'),
  phone: z.string().min(1, 'Vui lòng nhập SĐT'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  source: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).default('new'),
});

exports.updateLeadSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  assignedTo: z.string().optional(),
});

exports.addNoteSchema = z.object({
  content: z.string().min(1, 'Nội dung ghi chú không được để trống'),
});

exports.convertToOrderSchema = z.object({
  serviceId: z.string().min(1, 'Thiếu thông tin dịch vụ'),
  storeProductId: z.string().optional(),
  price: z.number().min(0, 'Giá không hợp lệ'),
  qty: z.number().min(1).default(1),
});
