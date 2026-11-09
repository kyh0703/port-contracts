const { test } = require('node:test');
const assert = require('node:assert/strict');
const { NodeModelSettings } = require('../dist/gen/ts/port/api/v1/agent_session');

test('published model controls retain optional values and explicit zeros through binary and JSON', () => {
  const configured = {
    temperature: 0, maxTokens: 16384, reasoningEffort: 'max', frequencyPenalty: -0.5,
    topP: 0.8, presencePenalty: 0.25,
    seed: 0, verbosity: 'low', serviceTier: 'fast',
    historyMaxBytes: 32768,
  };
  const wire = NodeModelSettings.fromPartial(configured);
  const binary = NodeModelSettings.decode(NodeModelSettings.encode(wire).finish());
  for (const [key, value] of Object.entries(configured)) assert.equal(binary[key], value, key);
  const json = NodeModelSettings.fromJSON(NodeModelSettings.toJSON(binary));
  for (const [key, value] of Object.entries(configured)) assert.equal(json[key], value, key);
  const absent = NodeModelSettings.decode(new Uint8Array());
  for (const key of Object.keys(configured)) assert.equal(absent[key], undefined, key);
});
