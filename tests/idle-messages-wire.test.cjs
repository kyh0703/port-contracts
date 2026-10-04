const assert = require('node:assert/strict');
const test = require('node:test');
const { CallLimitsRuntime, ConversationControlRuntime } = require('../dist/gen/ts/port/api/v1/agent_session.js');

test('legacy conversation controls leave idle messages disabled', () => {
  const control = ConversationControlRuntime.decode(new Uint8Array());
  assert.equal(control.idleMessage, undefined);
});

for (const mode of ['exact', 'prompt']) {
  for (const resetOnUserSpeech of [false, true]) {
    test(`idle ${mode} settings preserve text and reset=${resetOnUserSpeech} on the wire`, () => {
      const idleMessage = {
        mode,
        message: '  여보세요?\n잘 들리시나요?  ',
        timeoutSeconds: 10,
        maxCount: 2,
        resetOnUserSpeech,
      };
      const control = ConversationControlRuntime.fromJSON({ idleMessage });
      const decoded = ConversationControlRuntime.decode(ConversationControlRuntime.encode(control).finish());
      assert.deepEqual(decoded.idleMessage, idleMessage);
      // New field remains additive after the three existing control fields.
      assert.equal(ConversationControlRuntime.encode(control).finish()[0], 34);
    });
  }
}

test('legacy positive silence timeouts do not imply consent to automatic termination', () => {
  // Existing fields: dial wait 10s, max duration 600s, silence timeout 30s.
  const legacy = Uint8Array.from([8, 10, 16, 216, 4, 24, 30]);
  const decoded = CallLimitsRuntime.decode(legacy);
  assert.equal(decoded.noAnswerTimeoutEnabled, false);
  assert.equal(decoded.noAnswerTimeoutSeconds, 30);
  assert.equal(decoded.maxCallDurationSeconds, 600);
});

test('explicit silence opt-in survives serialization without changing retained limits', () => {
  for (const noAnswerTimeoutEnabled of [true, false]) {
    const limits = CallLimitsRuntime.fromJSON({
      dialWaitTimeSeconds: 10,
      maxCallDurationSeconds: 600,
      noAnswerTimeoutSeconds: 45,
      noAnswerTimeoutEnabled,
    });
    const decoded = CallLimitsRuntime.decode(CallLimitsRuntime.encode(limits).finish());
    assert.equal(decoded.noAnswerTimeoutEnabled, noAnswerTimeoutEnabled);
    assert.equal(decoded.noAnswerTimeoutSeconds, 45);
    assert.equal(decoded.maxCallDurationSeconds, 600);
  }
});
