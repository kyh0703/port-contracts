const assert = require('node:assert/strict');
const test = require('node:test');
const { NodeToolMetadata, BuiltInTool, PublishedHandoffRoute } = require('../dist/gen/ts/port/api/v1/agent_session.js');

test('preserves tool message behavior options on the wire', () => {
  const message = { type: 'request-complete', content: 'Explain the outcome', role: 'system', conditions: { items: [{ param: 'count', operator: 'gte', value: '2' }] } };
  const codec = NodeToolMetadata;
  const value = codec.fromJSON({ toolId: 'lookup', kind: 'api', name: 'lookup', messages: { items: [message, { type: 'request-start', content: '', blocking: true }] } });
  const decoded = codec.decode(codec.encode(value).finish());
  assert.equal(decoded.messages.items[0].role, 'system');
  assert.deepEqual(decoded.messages.items[0].conditions.items, message.conditions.items);
  assert.equal(decoded.messages.items[1].blocking, true);
  assert.equal(decoded.messages.items[1].content, '');
});

test('common tool messages round-trip for remote tools, built-ins and handoff routes', () => {
  const messages = { items: [
    { type: 'request-start', content: ' 확인하겠습니다.\n' },
    { type: 'request-start', content: '다른 시작 안내' },
    { type: 'request-response-delayed', content: '기다려 주세요.', timingMilliseconds: 3000 },
    { type: 'request-complete', content: '완료했습니다.' },
    { type: 'request-complete', content: '다른 완료 안내' },
    { type: 'request-failed', content: '처리하지 못했습니다.' },
  ] };
  for (const [codec, value, field] of [
    ...['api', 'mcp', 'a2a', 'knowledge'].map(kind => [NodeToolMetadata, { toolId: kind, kind, name: kind, messages }, 'messages']),
    ...['endCall', 'transferToHuman', 'dtmf', 'sendSms', 'speaker'].map(kind => [BuiltInTool, { [kind]: {}, messages }, 'messages']),
    [PublishedHandoffRoute, { toolMessages: messages }, 'toolMessages'],
  ]) {
    const roundTrip = codec.decode(codec.encode(codec.fromJSON(value)).finish());
    assert.deepEqual(codec.toJSON(roundTrip)[field], messages);
    assert.equal(codec.decode(new Uint8Array())[field], undefined);
  }
});
