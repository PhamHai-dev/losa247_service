const env = require('../config/env');

const stripCodeFence = (value) => value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

const generateJson = async ({ systemInstruction, prompt, responseSchema }) => {
  if (!env.GEMINI_API_KEY) {
    throw Object.assign(new Error('Gemini chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY'), { statusCode: 503, code: 'GEMINI_NOT_CONFIGURED' });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.GEMINI_TIMEOUT_MS);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json', responseSchema },
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw Object.assign(new Error(payload?.error?.message || 'Gemini không thể tạo bản dịch'), { statusCode: response.status === 429 ? 429 : 502, code: response.status === 429 ? 'GEMINI_RATE_LIMITED' : 'GEMINI_REQUEST_FAILED' });
    const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');
    if (!text) throw Object.assign(new Error('Gemini không trả về nội dung'), { statusCode: 502, code: 'GEMINI_EMPTY_RESPONSE' });
    return JSON.parse(stripCodeFence(text));
  } catch (error) {
    if (error.name === 'AbortError') throw Object.assign(new Error('Gemini phản hồi quá thời gian'), { statusCode: 504, code: 'GEMINI_TIMEOUT' });
    if (error instanceof SyntaxError) throw Object.assign(new Error('Gemini trả về dữ liệu không hợp lệ'), { statusCode: 502, code: 'GEMINI_INVALID_RESPONSE' });
    throw error;
  } finally { clearTimeout(timeout); }
};

const translateBlogPreview = (source) => generateJson({
  systemInstruction: 'You are a professional Vietnamese-to-English editor. Preserve HTML structure, links, image tags, facts, product names, and brand names. Return JSON only. Never add claims.',
  prompt: `Translate this Vietnamese blog into natural professional English. Create an SEO-friendly lowercase hyphenated slug. Keep metaDescription under 160 characters.\n\nSOURCE JSON:\n${JSON.stringify(source)}`,
  responseSchema: {
    type: 'OBJECT', required: ['title', 'slug', 'excerpt', 'metaDescription', 'content'],
    properties: { title: { type: 'STRING' }, slug: { type: 'STRING' }, excerpt: { type: 'STRING' }, metaDescription: { type: 'STRING' }, content: { type: 'STRING' } },
  },
});

const translateFaqPreview = (source) => generateJson({
  systemInstruction: 'You are a professional Vietnamese-to-English translator for customer-facing FAQ content. Preserve facts, product names, brand names, formatting, and intent. Use concise, natural professional English. Return JSON only and never add claims.',
  prompt: `Translate this Vietnamese FAQ into natural English.\n\nSOURCE JSON:\n${JSON.stringify(source)}`,
  responseSchema: {
    type: 'OBJECT', required: ['question', 'answer'],
    properties: { question: { type: 'STRING' }, answer: { type: 'STRING' } },
  },
});

const translateLeadFormPreview = (source) => generateJson({
  systemInstruction: 'You are a professional Vietnamese-to-English translator for a customer consultation form. Preserve every field id and array order exactly. Translate only title, submitLabel, labels, placeholders and option values. Return JSON only and never add fields or claims.',
  prompt: `Translate this Vietnamese consultation form into concise natural English.\n\nSOURCE JSON:\n${JSON.stringify(source)}`,
  responseSchema: {
    type: 'OBJECT', required: ['title', 'submitLabel', 'fields'],
    properties: { title: { type: 'STRING' }, submitLabel: { type: 'STRING' }, fields: { type: 'ARRAY', items: { type: 'OBJECT', required: ['id','label','placeholder','options'], properties: { id: { type: 'STRING' }, label: { type: 'STRING' }, placeholder: { type: 'STRING' }, options: { type: 'ARRAY', items: { type: 'STRING' } } } } } },
  },
});

const translatePricingPlanPreview = (source) => generateJson({
  systemInstruction: 'You are a professional Vietnamese-to-English translator for SaaS pricing content. Preserve numbers, currencies, billing periods, product and brand names. Keep array order and return JSON only. Never add claims.',
  prompt: `Translate this Vietnamese pricing plan into concise natural English.\n\nSOURCE JSON:\n${JSON.stringify(source)}`,
  responseSchema: {
    type: 'OBJECT', required: ['name', 'price', 'subtitle', 'badge', 'buttonText', 'feature'],
    properties: { name: { type: 'STRING' }, price: { type: 'STRING' }, subtitle: { type: 'ARRAY', items: { type: 'STRING' } }, badge: { type: 'STRING' }, buttonText: { type: 'STRING' }, feature: { type: 'ARRAY', items: { type: 'STRING' } } },
  },
});

const translatePricingComparisonPreview = async (source) => {
  const entries = Object.entries(source.values || {}).map(([key, value]) => ({ key, value: String(value ?? '') }));
  const translated = await generateJson({
    systemInstruction: 'You are a professional Vietnamese-to-English translator for SaaS pricing comparison content. Preserve every key exactly. Preserve booleans, numbers, currencies, product names and brand names. Translate only human-readable string values. Return JSON only.',
    prompt: `Translate this Vietnamese comparison row into concise natural English. Keep every entry key exactly unchanged and keep the same entry order.\n\nSOURCE JSON:\n${JSON.stringify({ title: source.title, entries })}`,
    responseSchema: {
      type: 'OBJECT', required: ['title', 'entries'],
      properties: {
        title: { type: 'STRING' },
        entries: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT', required: ['key', 'value'],
            properties: { key: { type: 'STRING' }, value: { type: 'STRING' } },
          },
        },
      },
    },
  });
  const translatedByKey = new Map((translated.entries || []).map(({ key, value }) => [key, value]));
  return {
    title: translated.title,
    values: Object.fromEntries(entries.map(({ key, value }) => [key, translatedByKey.get(key) ?? value])),
  };
};

module.exports = { translateBlogPreview, translateFaqPreview, translateLeadFormPreview, translatePricingPlanPreview, translatePricingComparisonPreview };

