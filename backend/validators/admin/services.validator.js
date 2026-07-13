const { z } = require('zod');

exports.serviceSchema = z.object({
  name: z.string().min(1, 'Tên dịch vụ không được để trống'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá không hợp lệ'),
  status: z.enum(['visible', 'hidden']).default('visible'),
  featured: z.boolean().default(false),
  images: z.array(z.string()).optional(),
});
