const assert = require('node:assert/strict');
const test = require('node:test');
const { SpeechPolicyRuntime } = require('../dist/gen/ts/port/api/v1/agent_session.js');

const legacy = Buffer.from('09000000000000f03f100119000000000000e03f', 'hex');
test('retains a legacy speech original without injecting client speaking defaults', () => {
  const decoded = SpeechPolicyRuntime.decode(legacy);
  assert.equal(decoded.clientSpeakingPlan, undefined);
  assert.deepEqual(Buffer.from(SpeechPolicyRuntime.encode(decoded).finish()), legacy);
});

for (const [name, suffix, expected] of [
  ['enabled zero waits', '22020801', { enabled: true, onPunctuationSeconds: 0, onNoPunctuationSeconds: 0, onNumberSeconds: 0, waitSeconds: 0 }],
  ['inactive zero waits', '2200', { enabled: false, onPunctuationSeconds: 0, onNoPunctuationSeconds: 0, onNumberSeconds: 0, waitSeconds: 0 }],
  ['active Vapi-style waits', '22260801119a9999999999b93f19000000000000f83f21000000000000e03f299a9999999999d93f', { enabled: true, onPunctuationSeconds: 0.1, onNoPunctuationSeconds: 1.5, onNumberSeconds: 0.5, waitSeconds: 0.4 }],
  ['inactive prepared waits', '2224119a9999999999b93f19000000000000f83f21000000000000e03f299a9999999999d93f', { enabled: false, onPunctuationSeconds: 0.1, onNoPunctuationSeconds: 1.5, onNumberSeconds: 0.5, waitSeconds: 0.4 }],
]) {
  test(`decodes field 4 ${name} without changing other original speech policy bytes`, () => {
    const wire = Buffer.concat([legacy, Buffer.from(suffix, 'hex')]);
    const decoded = SpeechPolicyRuntime.decode(wire);
    assert.deepEqual(decoded.clientSpeakingPlan, expected);
    assert.equal(decoded.responseSpeed, 1);
    assert.equal(decoded.allowInterruptions, true);
    assert.equal(decoded.eotOnNumberSecs, 0.5);
    assert.deepEqual(Buffer.from(SpeechPolicyRuntime.encode(decoded).finish()), wire);
    assert.deepEqual(SpeechPolicyRuntime.fromJSON(SpeechPolicyRuntime.toJSON(decoded)).clientSpeakingPlan, expected);
  });
}
