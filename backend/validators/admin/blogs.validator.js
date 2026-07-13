const { z } = require('zod');

exports.createBlogCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
});

exports.createBlogSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Nội dung không được để trống'),
  coverImageUrl: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});
