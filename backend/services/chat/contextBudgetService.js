const env = require('../../config/env');
const { jsonCharLength, truncateCodePoints } = require('./chatLimitUtils');

const emptyContext = (botCycle) => ({
  summary: '',
  recentMessages: [],
  currentBatch: [],
  sessionContext: {},
  contextMeta: { budget: env.CHAT_CONTEXT_MAX_CHARS, usedChars: 0, droppedMessages: 0, truncated: false, botCycle },
});

const compactMessage = (message, available) => {
  const withoutContent = { ...message, content: '' };
  const overhead = jsonCharLength(withoutContent);
  if (overhead >= available) return null;
  return { ...message, content: truncateCodePoints(message.content, available - overhead) };
};

const buildBudgetedContext = ({ currentBatch = [], recentMessages = [], sessionContext = {}, botCycle }) => {
  const result = emptyContext(botCycle);
  const sourceMessages = [
    ...currentBatch.map((message) => ({ bucket: 'currentBatch', message })),
    ...[...recentMessages].reverse().map((message) => ({ bucket: 'recentMessages', message })),
  ];

  for (const item of sourceMessages) {
    const candidate = { ...result, [item.bucket]: [...result[item.bucket], item.message] };
    if (jsonCharLength(candidate) <= env.CHAT_CONTEXT_MAX_CHARS) {
      result[item.bucket].push(item.message);
      continue;
    }
    const available = env.CHAT_CONTEXT_MAX_CHARS - jsonCharLength(result) - 64;
    const compacted = compactMessage(item.message, available);
    if (compacted) result[item.bucket].push(compacted);
    result.contextMeta.truncated = true;
    result.contextMeta.droppedMessages += 1;
    break;
  }
  result.recentMessages.reverse();

  const rawSessionContext = JSON.stringify(sessionContext || {});
  const sessionLimit = Math.min(env.CHAT_CONTEXT_SESSION_MAX_CHARS, Math.max(0, env.CHAT_CONTEXT_MAX_CHARS - jsonCharLength(result) - 64));
  if (sessionLimit > 0 && rawSessionContext !== '{}') {
    result.sessionContext = { note: truncateCodePoints(rawSessionContext, sessionLimit) };
    if (jsonCharLength(result) > env.CHAT_CONTEXT_MAX_CHARS) result.sessionContext = {};
    if (codePointLengthSafe(rawSessionContext) > sessionLimit) result.contextMeta.truncated = true;
  }
  result.contextMeta.usedChars = jsonCharLength(result);
  return result;
};

const codePointLengthSafe = (value) => Array.from(String(value || '')).length;

module.exports = { buildBudgetedContext };
