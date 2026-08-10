const { z } = require('zod');

exports.faqSchema = z.object({
  question: z.string().min(1, 'Câu hỏi không được để trống'),
  answer: z.string().min(1, 'Câu trả lời không được để trống'),
  page: z.enum(['home', 'solutions', 'pricing', 'blog']).default('home'),
  category: z.string().optional(),
  serviceDetail: z.enum(['chatbot', 'crm', 'marketing']).optional(),
  order: z.number().default(0),
});
