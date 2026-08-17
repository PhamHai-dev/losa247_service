const { z } = require('zod');

const optionalService = z.preprocess(
  (value) => value === '' || value == null ? undefined : value,
  z.enum(['chatbot', 'crm', 'marketing']).optional(),
);

exports.faqSchema = z.object({
  question: z.string().trim().min(1, 'Câu hỏi không được để trống').max(300, 'Câu hỏi tối đa 300 ký tự'),
  answer: z.string().trim().min(1, 'Câu trả lời không được để trống').max(5000, 'Câu trả lời tối đa 5000 ký tự'),
  page: z.enum(['home', 'solutions', 'pricing', 'blog']).default('home'),
  category: z.string().optional(),
  serviceDetail: optionalService,
  order: z.coerce.number().int().min(0, 'Thứ tự không được âm').default(0),
}).strict();
