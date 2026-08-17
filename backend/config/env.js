require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const parseBoolean = (value, fallback) => (value == null ? fallback : value === 'true');
const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ADMIN_SECRET: process.env.JWT_ADMIN_SECRET,
  JWT_CLIENT_SECRET: process.env.JWT_CLIENT_SECRET,
  JWT_ISSUER: process.env.JWT_ISSUER || 'losa247-api',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  COOKIE_SECURE: parseBoolean(process.env.COOKIE_SECURE, isProduction),
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
  TRUST_PROXY: parseBoolean(process.env.TRUST_PROXY, false),
  N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET,
  N8N_INBOUND_SECRET: process.env.N8N_INBOUND_SECRET || process.env.N8N_WEBHOOK_SECRET,
  N8N_OUTBOUND_SECRET: process.env.N8N_OUTBOUND_SECRET || process.env.N8N_WEBHOOK_SECRET,
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  N8N_CALLBACK_URL: process.env.N8N_CALLBACK_URL || `http://localhost:${process.env.PORT || 5000}/api/v1/webhooks/n8n/chat-reply`,
  N8N_TIMEOUT_MS: parseInteger(process.env.N8N_TIMEOUT_MS, 30000),
  N8N_REPLAY_WINDOW_MS: parseInteger(process.env.N8N_REPLAY_WINDOW_MS, 5 * 60 * 1000),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || 465,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: parseInteger(process.env.REDIS_PORT, 6379),
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: parseInteger(process.env.REDIS_DB, 0),
  REDIS_TLS: parseBoolean(process.env.REDIS_TLS, false),
  CHAT_QUEUE_PREFIX: process.env.CHAT_QUEUE_PREFIX || 'losa247',
  CHAT_WORKER_CONCURRENCY: parseInteger(process.env.CHAT_WORKER_CONCURRENCY, 5),
  CHAT_DEBOUNCE_MS: parseInteger(process.env.CHAT_DEBOUNCE_MS, 3000),
  CHAT_RECENT_MESSAGE_LIMIT: parseInteger(process.env.CHAT_RECENT_MESSAGE_LIMIT, 20),
  CHAT_JOB_ATTEMPTS: parseInteger(process.env.CHAT_JOB_ATTEMPTS, 4),
  CHAT_JOB_BACKOFF_MS: parseInteger(process.env.CHAT_JOB_BACKOFF_MS, 2000),
  OUTBOX_POLL_MS: parseInteger(process.env.OUTBOX_POLL_MS, 1000),
  OUTBOX_BATCH_SIZE: parseInteger(process.env.OUTBOX_BATCH_SIZE, 50),
  OUTBOX_MAX_ATTEMPTS: parseInteger(process.env.OUTBOX_MAX_ATTEMPTS, 20),
  RUN_CHAT_WORKERS_IN_API: parseBoolean(process.env.RUN_CHAT_WORKERS_IN_API, !isProduction),
};

const errors = [];
for (const key of ['DATABASE_URL', 'JWT_ADMIN_SECRET', 'JWT_CLIENT_SECRET']) {
  if (!env[key]) {
    errors.push(`Thiếu biến môi trường bắt buộc: ${key}`);
  }
}
for (const key of ['JWT_ADMIN_SECRET', 'JWT_CLIENT_SECRET']) {
  if (env[key] && Buffer.byteLength(env[key]) < 32) {
    errors.push(`${key} phải dài tối thiểu 32 bytes`);
  }
}
if (env.JWT_ADMIN_SECRET && env.JWT_ADMIN_SECRET === env.JWT_CLIENT_SECRET) {
  errors.push('JWT_ADMIN_SECRET và JWT_CLIENT_SECRET phải khác nhau');
}
if (isProduction && !env.N8N_WEBHOOK_SECRET) {
  errors.push('Production bắt buộc có N8N_WEBHOOK_SECRET');
}
if (errors.length) {
  throw new Error(`[SECURITY CONFIG] ${errors.join('; ')}`);
}

module.exports = env;
