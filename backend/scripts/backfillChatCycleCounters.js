const { prisma } = require('../config/prisma');
const env = require('../config/env');
const { codePointLength } = require('../services/chat/chatLimitUtils');

const PAGE_SIZE = 100;

const main = async () => {
  let cursor;
  let processed = 0;
  do {
    const sessions = await prisma.chatSession.findMany({
      where: { status: 'open' },
      orderBy: { id: 'asc' },
      take: PAGE_SIZE,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: { id: true, mode: true, version: true },
    });
    for (const session of sessions) {
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId: session.id, sender: 'customer' },
        select: { content: true, _count: { select: { attachmentRows: true } } },
      });
      const messageCount = messages.length;
      const units = messages.reduce((sum, item) => sum + codePointLength(item.content) + item._count.attachmentRows * env.CHAT_ATTACHMENT_CONTEXT_UNITS, 0);
      const reached = messageCount >= env.CHAT_CYCLE_MAX_CUSTOMER_MESSAGES || units >= env.CHAT_CYCLE_MAX_UNITS;
      await prisma.chatSession.update({
        where: { id: session.id },
        data: {
          cycleCustomerMessageCount: messageCount,
          cycleCustomerUnits: units,
          ...(reached ? { mode: 'human', automationStatus: 'idle', cycleLimitReachedAt: new Date(), handoffAt: new Date(), version: { increment: session.mode === 'bot' ? 1 : 0 } } : {}),
        },
      });
      processed += 1;
    }
    cursor = sessions.at(-1)?.id;
    if (sessions.length < PAGE_SIZE) break;
  } while (cursor);
  console.info(`[chat-cycle-backfill] Updated ${processed} open sessions`);
};

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
