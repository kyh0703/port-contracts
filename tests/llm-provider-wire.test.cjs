const assert = require('node:assert/strict');
const test = require('node:test');
const { LlmRuntime } = require('../dist/gen/ts/port/api/v1/voice_runtime.js');
const { LlmAuditRequestContext } = require('../dist/gen/ts/port/api/v1/agent_session.js');

test('pins the LLM provider separately from model identity on the wire', () => {
  for (const provider of ['openai', 'openrouter']) {
    const value = LlmRuntime.fromJSON({ apiKey: 'fixture', model: 'openai/gpt-4o-mini', provider });
    assert.equal(LlmRuntime.decode(LlmRuntime.encode(value).finish()).provider, provider);
    const audit = LlmAuditRequestContext.fromJSON({ requestedModel: 'openai/gpt-4o-mini', provider });
    assert.equal(LlmAuditRequestContext.decode(LlmAuditRequestContext.encode(audit).finish()).provider, provider);
  }
  assert.equal(LlmRuntime.decode(new Uint8Array()).provider, undefined);
  assert.equal(LlmAuditRequestContext.decode(new Uint8Array()).provider, undefined);
});
