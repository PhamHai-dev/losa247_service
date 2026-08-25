const env = require('../config/env');

const stripCodeFence = (value) => value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

const translateBlogPreview = async (source) => {
  if (!env.GEMINI_API_KEY) {
    throw Object.assign(new Error('Gemini chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY'), { statusCode: 503, code: 'GEMINI_NOT_CONFIGURED' });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.GEMINI_TIMEOUT_MS);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are a professional Vietnamese-to-English editor. Preserve HTML structure, links, image tags, facts, product names, and brand names. Return JSON only. Never add claims.' }] },
        contents: [{ role: 'user', parts: [{ text: `Translate this Vietnamese blog into natural professional English. Create an SEO-friendly lowercase hyphenated slug. Keep metaDescription under 160 characters.\n\nSOURCE JSON:\n${JSON.stringify(source)}` }] }],
        generationConfig: {
          temperature: 0.2, responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT', required: ['title', 'slug', 'excerpt', 'metaDescription', 'content'],
            properties: { title: { type: 'STRING' }, slug: { type: 'STRING' }, excerpt: { type: 'STRING' }, metaDescription: { type: 'STRING' }, content: { type: 'STRING' } },
          },
        },
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

module.exports = { translateBlogPreview };

