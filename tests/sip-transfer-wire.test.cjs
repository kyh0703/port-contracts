const assert = require('node:assert/strict');
const test = require('node:test');
const c = require('../dist/gen/ts/port/api/v1/agent_session.js');

test('transfer policy is additive and preserves absent legacy configuration', () => {
  const legacy = c.TransferToHumanTool.decode(c.TransferToHumanTool.encode(c.TransferToHumanTool.create({sipCallTo: '+821012345678', ringingTimeoutMs: 30000})).finish());
  assert.equal(legacy.mode, undefined);
  assert.equal(legacy.consultationTimeoutMs, undefined);
  const policy = c.TransferToHumanTool.create({sipCallTo: '+821012345678', ringingTimeoutMs: 30000, mode: 'consultative', consultationTimeoutMs: 60000});
  assert.equal(c.TransferToHumanTool.decode(c.TransferToHumanTool.encode(policy).finish()).mode, 'consultative');
  assert.equal(c.TransferToHumanTool.decode(c.TransferToHumanTool.encode(policy).finish()).consultationTimeoutMs, 60000);
});
