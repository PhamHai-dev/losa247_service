const { createClient } = require('redis');
const env = require('./env');

let client;
let connectPromise;
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

  const socket = env.REDIS_SOCKET_PATH
    ? {
        path: env.REDIS_SOCKET_PATH,
        connectTimeout: 3000,
        reconnectStrategy: (retries) => (retries >= 3 ? false : Math.min(retries * 200, 1000)),
      }
    : {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        tls: env.REDIS_TLS,
        servername: env.REDIS_TLS ? env.REDIS_HOST : undefined,
        connectTimeout: 3000,
        reconnectStrategy: (retries) => (retries >= 3 ? false : Math.min(retries * 200, 1000)),
      };

  client = createClient({
    username: env.REDIS_USERNAME || undefined,
    password: env.REDIS_PASSWORD || undefined,
    database: env.REDIS_DB,
    socket,
  });

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
  if (redisClient.isReady) return redisClient;

  if (!connectPromise) {
    connectPromise = redisClient.connect()
      .then(() => redisClient)
      .catch((error) => {
        logError(error);
        return null;
      })
      .finally(() => { connectPromise = undefined; });
  }

  return connectPromise;
};

module.exports = { getReadyClient, isEnabled };
