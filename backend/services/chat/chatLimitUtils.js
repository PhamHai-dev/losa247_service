const codePointLength = (value = '') => Array.from(String(value)).length;

const truncateCodePoints = (value, maxChars, marker = '…') => {
  const chars = Array.from(String(value || ''));
  if (chars.length <= maxChars) return chars.join('');
  if (maxChars <= 0) return '';
  const markerChars = Array.from(marker);
  if (markerChars.length >= maxChars) return markerChars.slice(0, maxChars).join('');
  return chars.slice(0, maxChars - markerChars.length).join('') + marker;
};

const customerMessageUnits = (content, attachmentCount, attachmentUnits) => (
  codePointLength(content) + Math.max(0, Number(attachmentCount) || 0) * attachmentUnits
);

const jsonCharLength = (value) => codePointLength(JSON.stringify(value));

module.exports = { codePointLength, truncateCodePoints, customerMessageUnits, jsonCharLength };
