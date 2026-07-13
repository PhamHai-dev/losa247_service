const { z } = require('zod');

exports.faqSchema = z.object({
  question: z.string().min(1, 'Câu hỏi không được để trống'),
  answer: z.string().min(1, 'Câu trả lời không được để trống'),
  category: z.string().optional(),
  relatedService: z.string().optional(),
  order: z.number().default(0),
});
