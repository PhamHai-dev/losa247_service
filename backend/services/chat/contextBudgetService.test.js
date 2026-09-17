const test = require('node:test');
const assert = require('node:assert/strict');
const env = require('../../config/env');
const { jsonCharLength } = require('./chatLimitUtils');
const { buildBudgetedContext } = require('./contextBudgetService');

test('keeps generated context inside configured hard cap', () => {
  const context = buildBudgetedContext({
    botCycle: 2,
    currentBatch: [{ id: 'current', sender: 'customer', content: '😀'.repeat(60000), attachments: [] }],
    recentMessages: [{ id: 'old', sender: 'bot', content: 'old'.repeat(10000), attachments: [] }],
    sessionContext: { note: 'context'.repeat(1000) },
  });
  assert.ok(jsonCharLength(context) <= env.CHAT_CONTEXT_MAX_CHARS);
  assert.equal(context.summary, '');
  assert.equal(context.contextMeta.botCycle, 2);
  assert.equal(context.contextMeta.truncated, true);
});
