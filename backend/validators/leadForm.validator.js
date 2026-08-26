const { z } = require('zod');

const DEFAULT_LEAD_FORM_CONFIG = Object.freeze({ version: 1, title: 'Đăng ký nhận tư vấn / trải nghiệm', submitLabel: 'Gửi yêu cầu', fields: [
  { id: 'name', key: 'name', type: 'text', label: 'Họ và tên', placeholder: 'Nhập họ và tên của bạn', required: true, enabled: true, options: [] },
  { id: 'phone', key: 'phone', type: 'phone', label: 'Số điện thoại', placeholder: 'Nhập số điện thoại', required: true, enabled: true, options: [] },
  { id: 'email', key: 'email', type: 'email', label: 'Email', placeholder: 'you@company.vn', required: false, enabled: true, options: [] },
  { id: 'message', key: 'message', type: 'textarea', label: 'Lời nhắn', placeholder: 'Nhu cầu bạn đang quan tâm...', required: false, enabled: true, options: [] },
], translations: {} });

const fieldSchema = z.object({ id: z.string().trim().min(1).max(80), key: z.string().trim().regex(/^[a-z][a-zA-Z0-9_]*$/).max(80), type: z.enum(['text','phone','email','textarea','number','select','checkbox']), label: z.string().trim().min(1).max(120), placeholder: z.string().trim().max(240).optional().default(''), required: z.boolean().default(false), enabled: z.boolean().default(true), options: z.array(z.string().trim().min(1).max(120)).max(50).default([]) });
const translatedFieldSchema = z.object({ id: z.string().trim().min(1).max(80), label: z.string().trim().min(1).max(120), placeholder: z.string().trim().max(240).optional().default(''), options: z.array(z.string().trim().min(1).max(120)).max(50).default([]) });
const englishSchema = z.object({ title: z.string().trim().min(1).max(160), submitLabel: z.string().trim().min(1).max(80), fields: z.array(translatedFieldSchema).min(1).max(30) });

const leadFormConfigSchema = z.object({
  version: z.number().int().positive().default(1), title: z.string().trim().min(1).max(160), submitLabel: z.string().trim().min(1).max(80), fields: z.array(fieldSchema).min(1).max(30),
  translations: z.object({ en: englishSchema.optional() }).default({}),
}).superRefine((config, ctx) => {
  const keys = new Set();
  config.fields.forEach((field,index) => { if(keys.has(field.key)) ctx.addIssue({code:z.ZodIssueCode.custom,path:['fields',index,'key'],message:'Mã trường không được trùng'}); keys.add(field.key); if(field.type==='select'&&!field.options.length) ctx.addIssue({code:z.ZodIssueCode.custom,path:['fields',index,'options'],message:'Danh sách chọn cần ít nhất một lựa chọn'}); });
  if(!config.fields.some((field)=>field.enabled&&['phone','email'].includes(field.type))) ctx.addIssue({code:z.ZodIssueCode.custom,path:['fields'],message:'Form cần ít nhất một trường email hoặc số điện thoại'});
  if (config.translations.en) {
    const sourceIds = config.fields.map((field) => field.id);
    const translatedIds = config.translations.en.fields.map((field) => field.id);
    if (sourceIds.length !== translatedIds.length || sourceIds.some((id, index) => id !== translatedIds[index])) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['translations','en','fields'], message: 'Các trường English phải khớp đúng thứ tự với Tiếng Việt' });
    config.fields.forEach((field, index) => { if (field.type === 'select' && config.translations.en.fields[index]?.options.length !== field.options.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['translations','en','fields',index,'options'], message: 'Số lựa chọn English phải khớp Tiếng Việt' }); });
  }
});

const normalizeLeadFormConfig = (value) => { const parsed=leadFormConfigSchema.safeParse(value); return parsed.success?parsed.data:DEFAULT_LEAD_FORM_CONFIG; };
const resolveLeadFormConfig = (value, locale = 'vi') => { const config = normalizeLeadFormConfig(value); const translation = locale === 'en' ? config.translations?.en : null; if (!translation) return config; const byId = new Map(translation.fields.map((field) => [field.id, field])); return { version: config.version, title: translation.title, submitLabel: translation.submitLabel, fields: config.fields.map((field) => ({ ...field, ...(byId.get(field.id) || {}) })) }; };
const validateSubmission = (config, values) => { const output={}; for(const field of config.fields.filter((item)=>item.enabled)){ let value=values?.[field.key]; if(typeof value==='string') value=value.trim(); const empty=value===undefined||value===null||value===''||value===false; if(field.required&&empty) throw new Error(`Vui lòng nhập ${field.label}`); if(empty) continue; if(field.type==='email'&&!z.string().email().safeParse(value).success) throw new Error(`${field.label} không hợp lệ`); if(field.type==='number'&&!Number.isFinite(Number(value))) throw new Error(`${field.label} phải là số`); if(field.type==='select'&&!field.options.includes(String(value))) throw new Error(`${field.label} không hợp lệ`); output[field.key]=field.type==='number'?Number(value):value; } return output; };

module.exports={DEFAULT_LEAD_FORM_CONFIG,leadFormConfigSchema,englishSchema,normalizeLeadFormConfig,resolveLeadFormConfig,validateSubmission};
