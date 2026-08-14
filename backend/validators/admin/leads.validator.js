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
  source: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  assignedTo: z.string().optional(),
});

exports.addNoteSchema = z.object({
  content: z.string().min(1, 'Nội dung ghi chú không được để trống'),
});


const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'ID không hợp lệ');
const leadIds = z.array(objectId).min(1, 'Cần chọn ít nhất một Lead').max(500, 'Chỉ được thao tác tối đa 500 Lead/lần');

exports.bulkUpdateLeadSchema = z.object({
  ids: leadIds,
  data: z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
    source: z.enum(['form', 'chat', 'facebook', 'zalo', 'other']).optional(),
    assignedTo: objectId.nullable().optional(),
  }).refine((data) => Object.keys(data).length > 0, 'Không có dữ liệu cập nhật'),
});

exports.bulkDeleteLeadSchema = z.object({ ids: leadIds });

exports.bulkEmailLeadSchema = z.object({
  ids: leadIds,
  subject: z.string().trim().min(1, 'Vui lòng nhập tiêu đề').max(200, 'Tiêu đề quá dài'),
  content: z.string().trim().min(1, 'Vui lòng nhập nội dung').max(50000, 'Nội dung quá dài'),
});
