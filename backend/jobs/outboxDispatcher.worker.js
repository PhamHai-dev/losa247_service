const os = require('os');
const { prisma } = require('../config/prisma');
const env = require('../config/env');
const { getChatQueue } = require('../config/queues');

const workerId = `${os.hostname()}:${process.pid}`;
let timer;
let running = false;

const dispatchOnce = async () => {
  const queue = getChatQueue();
  if (!queue || running) return;
  running = true;
  try {
    const candidates = await prisma.automationOutbox.findMany({ where: { status: { in: ['pending', 'failed'] }, availableAt: { lte: new Date() }, attempts: { lt: env.OUTBOX_MAX_ATTEMPTS } }, orderBy: { createdAt: 'asc' }, take: env.OUTBOX_BATCH_SIZE });
    for (const event of candidates) {
      const claimed = await prisma.automationOutbox.updateMany({ where: { id: event.id, status: event.status, attempts: event.attempts }, data: { status: 'dispatching', lockedAt: new Date(), lockedBy: workerId, attempts: { increment: 1 } } });
      if (!claimed.count) continue;
      try {
        await queue.add(event.eventType, { outboxId: event.id, eventId: event.eventId, sessionId: event.sessionId, payload: event.payload }, { jobId: event.eventId, attempts: env.CHAT_JOB_ATTEMPTS, backoff: { type: 'exponential', delay: env.CHAT_JOB_BACKOFF_MS }, removeOnComplete: 500, removeOnFail: 1000 });
        await prisma.automationOutbox.update({ where: { id: event.id }, data: { status: 'dispatched', dispatchedAt: new Date(), lockedAt: null, lockedBy: null, lastError: null } });
      } catch (error) {
        const delay = Math.min(60000, env.OUTBOX_POLL_MS * (2 ** Math.min(event.attempts, 6)));
        await prisma.automationOutbox.update({ where: { id: event.id }, data: { status: 'failed', availableAt: new Date(Date.now() + delay), lockedAt: null, lockedBy: null, lastError: String(error.message || error) } });
      }
    }
  } finally { running = false; }
};

const start = () => { if (!timer && getChatQueue()) { timer = setInterval(() => void dispatchOnce(), env.OUTBOX_POLL_MS); timer.unref(); void dispatchOnce(); } };
const stop = () => { if (timer) clearInterval(timer); timer = null; };
if (require.main === module) start();
module.exports = { start, stop, dispatchOnce };
