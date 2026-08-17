const { Worker } = require('bullmq');
const env = require('../config/env');
const { getQueueConnection, getDeadLetterQueue } = require('../config/queues');
const { createNextBatch, markProcessing, markFailed } = require('../services/chat/batchService');
const { buildAIContext } = require('../services/chat/historyService');
const { sendBatchToN8n } = require('../services/chat/automationService');

let worker;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const processJob = async (job) => {
  if (!['chat.message.received', 'chat.bot.resumed'].includes(job.name)) return { ignored: true };
  if (job.name === 'chat.message.received') await sleep(env.CHAT_DEBOUNCE_MS);
  const result = await createNextBatch(job.data.sessionId);
  if (!result.batch || result.deferred || result.empty || result.ignored) return result;
  const { batch } = result;
  try {
    await markProcessing(batch.id);
    const context = await buildAIContext(batch.sessionId, batch.id, env.CHAT_RECENT_MESSAGE_LIMIT);
    await sendBatchToN8n({ batch, context });
    return { accepted: true, batchId: batch.id };
  } catch (error) {
    await markFailed(batch.id, error);
    throw error;
  }
};

const start = () => {
  const connection = getQueueConnection();
  if (!connection || worker) return worker;
  worker = new Worker('chat-ai', processJob, { connection, prefix: env.CHAT_QUEUE_PREFIX, concurrency: env.CHAT_WORKER_CONCURRENCY, lockDuration: Math.max(env.N8N_TIMEOUT_MS * 2, 30000) });
  worker.on('failed', async (job, error) => {
    if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
      const dlq = getDeadLetterQueue();
      if (dlq) await dlq.add('chat.job.failed', { originalJobId: job.id, name: job.name, data: job.data, error: String(error.message || error) }, { jobId: `dlq-${job.id}` });
    }
  });
  return worker;
};
if (require.main === module) start();
module.exports = { start, processJob };
