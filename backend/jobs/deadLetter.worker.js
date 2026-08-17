const { Worker } = require('bullmq');
const env = require('../config/env');
const { getQueueConnection } = require('../config/queues');

let worker;
const start = () => {
  const connection = getQueueConnection();
  if (!connection || worker) return worker;
  worker = new Worker('chat-ai-dlq', async (job) => {
    console.error('[Chat DLQ]', JSON.stringify({ jobId: job.id, ...job.data }));
    return { loggedAt: new Date().toISOString() };
  }, { connection, prefix: env.CHAT_QUEUE_PREFIX, concurrency: 1 });
  return worker;
};
if (require.main === module) start();
module.exports = { start };
