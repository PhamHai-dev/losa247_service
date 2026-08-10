const { z } = require('zod');

exports.storeProductSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  price: z.number().min(0, 'Giá không hợp lệ'),
  platform: z.enum(['facebook', 'zalo', 'shopee', 'tiktok']),
  description: z.string().optional(),
  workflowImageUrl: z.string().optional(),
  n8nWorkflowJson: z.any().optional(), // Validate JSON hợp lệ sẽ xử lý trong controller
  status: z.enum(['visible', 'hidden']).default('visible'),
});
