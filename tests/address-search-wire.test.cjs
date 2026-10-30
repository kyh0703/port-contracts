const assert = require('node:assert/strict');
const test = require('node:test');
const { BuiltInTool, SearchRuntimeAddressRequest, SearchRuntimeAddressResponse } = require('../dist/gen/ts/port/api/v1/agent_session.js');

test('address built-in preserves original root identity and silent announcements on additive field seven', () => {
  const tool = BuiltInTool.fromJSON({ searchAddress: { condition: '위치 확인', toolReference: '019d0000-0000-7000-8000-000000000001' }, messages: { items: [{ type: 'request-start', content: '', blocking: false }] } });
  const decoded = BuiltInTool.decode(BuiltInTool.encode(tool).finish());
  assert.deepEqual(decoded.searchAddress, { condition: '위치 확인', toolReference: '019d0000-0000-7000-8000-000000000001' });
  assert.equal(decoded.messages.items[0].blocking, false);
  assert.equal(BuiltInTool.decode(BuiltInTool.encode(BuiltInTool.create({ endCall: { closingPhrase: '기존 종료', confirm: true } })).finish()).searchAddress, undefined);
  assert.equal(BuiltInTool.encode(BuiltInTool.create({ searchAddress: tool.searchAddress })).finish()[0], 58);
});

test('address RPC retains owner, node, root reference, Unicode query and structured outcome without provider secrets', () => {
  const request = SearchRuntimeAddressRequest.fromJSON({ owner: { executionId: '019d0000-0000-7000-8000-000000000002', epoch: 1, capability: 'a'.repeat(43) }, nodeId: 'entry', toolReference: '019d0000-0000-7000-8000-000000000001', query: '합성시 검증로 10 😀', searchType: 'address' });
  assert.deepEqual(SearchRuntimeAddressRequest.decode(SearchRuntimeAddressRequest.encode(request).finish()), request);
  const resultJson = JSON.stringify({ status: 'unavailable', candidates: [], hasMore: false, nextAction: 'explain_unavailable', errorCode: 'not_configured' });
  assert.equal(SearchRuntimeAddressResponse.decode(SearchRuntimeAddressResponse.encode({ resultJson }).finish()).resultJson, resultJson);
});
