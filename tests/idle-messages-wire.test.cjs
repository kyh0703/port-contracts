const assert = require('node:assert/strict');
const test = require('node:test');
const { ConversationControlRuntime } = require('../dist/gen/ts/port/api/v1/agent_session.js');

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
