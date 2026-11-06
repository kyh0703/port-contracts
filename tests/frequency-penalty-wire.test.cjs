const assert = require('node:assert/strict');
const test = require('node:test');
const { InlineAuthoringOptions, NodeModelSettings } = require('../dist/gen/ts/port/api/v1/agent_session.js');

for (const [name, value, wireHex] of [
  ['absent', undefined, ''],
  ['explicit zero', 0, '290000000000000000'],
  ['saved fraction', 0.3, '29333333333333d33f'],
  ['upper boundary', 2, '290000000000000040'],
]) {
  test(`model frequency penalty retains ${name} through binary encoding`, () => {
    const model = NodeModelSettings.fromPartial({ frequencyPenalty: value });
    const wire = Buffer.from(wireHex, 'hex');
    assert.deepEqual(Buffer.from(NodeModelSettings.encode(model).finish()), wire);
    assert.equal(NodeModelSettings.decode(wire).frequencyPenalty, value);

    const options = InlineAuthoringOptions.fromPartial({ model });
    const decoded = InlineAuthoringOptions.decode(InlineAuthoringOptions.encode(options).finish());
    assert.equal(decoded.model.frequencyPenalty, value);
  });

  test(`model frequency penalty retains ${name} through JSON encoding`, () => {
    const expected = value === undefined ? {} : { frequencyPenalty: value };
    const model = NodeModelSettings.fromPartial({ frequencyPenalty: value });
    const json = NodeModelSettings.toJSON(model);
    assert.deepEqual(json, expected);
    assert.equal(NodeModelSettings.fromJSON(json).frequencyPenalty, value);
    assert.equal(NodeModelSettings.fromJSON({ frequency_penalty: value }).frequencyPenalty, value);
  });
}
