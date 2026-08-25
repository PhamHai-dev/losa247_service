const { z } = require('zod');

const slugSchema = z.string().trim().max(255).optional();
const statusSchema = z.enum(['draft', 'scheduled', 'published']).default('draft');

const taxonomyTranslationSchema = z.object({
  name: z.string().trim().min(1, 'Tên không được để trống').max(255),
  slug: slugSchema,
  description: z.string().optional(),
});

const blogTranslationSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(500),
  slug: slugSchema,
  excerpt: z.string().optional(),
  metaDescription: z.string().optional(),
  content: z.string().min(1, 'Nội dung không được để trống'),
  status: statusSchema,
  publishedAt: z.coerce.date().nullable().optional(),
  allowIndexing: z.boolean().default(true),
  showToc: z.boolean().default(true),
}).superRefine((value, ctx) => {
  if (value.status === 'scheduled' && !value.publishedAt) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['publishedAt'], message: 'Vui lòng chọn thời gian đăng' });
  }
});

const optionalTranslation = (schema) => z.preprocess((value) => {
  if (!value || typeof value !== 'object') return undefined;
  const hasContent = Object.values(value).some((item) => item !== undefined && item !== null && String(item).trim() !== '');
  return hasContent ? value : undefined;
}, schema.optional());

const translationsSchema = (schema) => z.object({
  vi: schema,
  en: optionalTranslation(schema),
});

exports.createBlogCategorySchema = z.object({ translations: translationsSchema(taxonomyTranslationSchema) });
exports.createBlogTagSchema = z.object({ translations: translationsSchema(taxonomyTranslationSchema) });

exports.createBlogSchema = z.object({
  translations: translationsSchema(blogTranslationSchema),
  coverImageUrl: z.string().optional(),
  category: z.string().optional(),
  source: z.enum(['writer', 'other'], { required_error: 'Vui lòng chọn nguồn bài viết' }),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  allowComments: z.boolean().optional(),
});

exports.translatePreviewSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề tiếng Việt không được để trống').max(500),
  excerpt: z.string().max(2000).optional(),
  metaDescription: z.string().max(500).optional(),
  content: z.string().min(1, 'Nội dung tiếng Việt không được để trống').max(200000),
});

exports.blogTranslationSchema = blogTranslationSchema;
exports.taxonomyTranslationSchema = taxonomyTranslationSchema;
