const { z } = require('zod');

exports.createBlogCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
});

exports.createBlogSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  metaDescription: z.string().optional(),
  content: z.string().min(1, 'Nội dung không được để trống'),
  coverImageUrl: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'pending', 'published', 'rejected']).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  allowIndexing: z.boolean().optional(),
});
exports.createBlogTagSchema = z.object({
  name: z.string().min(1, 'Tên thẻ không được để trống'),
  slug: z.string().optional(),
  description: z.string().optional(),
});
