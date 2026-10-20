const assert = require('node:assert/strict');
const test = require('node:test');
const { SpeechPolicyRuntime } = require('../dist/gen/ts/port/api/v1/agent_session.js');

for (const value of [undefined, 0, 0.25, 0.5, 3]) {
  test(`number-ending EOT wait preserves optional presence and ${value} seconds`, () => {
    const policy = SpeechPolicyRuntime.create({ responseSpeed: 1, allowInterruptions: true, eotOnNumberSecs: value });
    const decoded = SpeechPolicyRuntime.decode(SpeechPolicyRuntime.encode(policy).finish());
    assert.equal(decoded.eotOnNumberSecs, value);
    assert.equal(SpeechPolicyRuntime.fromJSON(SpeechPolicyRuntime.toJSON(decoded)).eotOnNumberSecs, value);
  });
}
