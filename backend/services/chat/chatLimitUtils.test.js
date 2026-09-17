const test = require('node:test');
const assert = require('node:assert/strict');
const { codePointLength, truncateCodePoints, customerMessageUnits } = require('./chatLimitUtils');

test('counts Unicode code points instead of UTF-16 units', () => {
  assert.equal(codePointLength('A😀B'), 3);
});

test('truncates without breaking emoji', () => {
  assert.equal(truncateCodePoints('A😀BC', 3, ''), 'A😀B');
});

test('adds configured units for attachments', () => {
  assert.equal(customerMessageUnits('😀x', 2, 1000), 2002);
});
