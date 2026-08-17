const IORedis = require('ioredis');
const { Queue } = require('bullmq');
const env = require('./env');

let connection;
let chatQueue;
let deadLetterQueue;

const getQueueConnection = () => {
  if (!env.REDIS_HOST) return null;
  if (!connection) connection = new IORedis({ host: env.REDIS_HOST, port: env.REDIS_PORT, username: env.REDIS_USERNAME || undefined, password: env.REDIS_PASSWORD || undefined, db: env.REDIS_DB, tls: env.REDIS_TLS ? { servername: env.REDIS_HOST } : undefined, maxRetriesPerRequest: null, enableReadyCheck: false });
  return connection;
};

const getChatQueue = () => {
  const conn = getQueueConnection();
  if (!conn) return null;
  if (!chatQueue) chatQueue = new Queue('chat-ai', { connection: conn, prefix: env.CHAT_QUEUE_PREFIX });
  return chatQueue;
};
const getDeadLetterQueue = () => {
  const conn = getQueueConnection();
  if (!conn) return null;
  if (!deadLetterQueue) deadLetterQueue = new Queue('chat-ai-dlq', { connection: conn, prefix: env.CHAT_QUEUE_PREFIX });
  return deadLetterQueue;
};

module.exports = { getQueueConnection, getChatQueue, getDeadLetterQueue };
