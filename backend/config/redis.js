const Redis = require('ioredis');
const env = require('./env');

let client;
let lastErrorMessage;

const isEnabled = () => Boolean(env.REDIS_SOCKET_PATH || env.REDIS_HOST);

const logError = (error) => {
  const message = error?.message || String(error);
  if (message !== lastErrorMessage) {
    console.error(`[Redis] ${message}`);
    lastErrorMessage = message;
  }
};

const getClient = () => {
  if (!isEnabled()) return null;
  if (client) return client;

  const options = env.REDIS_SOCKET_PATH
    ? {
      path: env.REDIS_SOCKET_PATH,
      username: env.REDIS_USERNAME || undefined,
      password: env.REDIS_PASSWORD || undefined,
      db: env.REDIS_DB,
      connectTimeout: 3000,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
    }
    : {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      tls: env.REDIS_TLS ? { servername: env.REDIS_HOST } : undefined,
      username: env.REDIS_USERNAME || undefined,
      password: env.REDIS_PASSWORD || undefined,
      db: env.REDIS_DB,
      connectTimeout: 3000,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
    };

  client = new Redis(options);
  client.on('error', logError);
  client.on('ready', () => {
    lastErrorMessage = undefined;
    const endpoint = env.REDIS_SOCKET_PATH || `${env.REDIS_HOST}:${env.REDIS_PORT}`;
    console.log(`Redis Connected: ${endpoint} (DB ${env.REDIS_DB})`);
  });

  return client;
};

const getReadyClient = async () => {
  const redisClient = getClient();
  if (!redisClient) return null;
  if (redisClient.status === 'ready') return redisClient;
  try {
    if (redisClient.status === 'wait' || redisClient.status === 'end') {
      await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 3000))
      ]);
    }
    // If it's connecting, but not ready yet, and we don't want to hang the caller
    if (redisClient.status !== 'ready') return null;
    return redisClient;
  } catch (error) {
    logError(error);
    return null;
  }
};

module.exports = { getReadyClient, isEnabled };