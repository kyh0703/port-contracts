const assert = require('node:assert/strict');
const test = require('node:test');
const { McpServerRuntime, PublishedAgentNodeRuntime } = require('../dist/gen/ts/port/api/v1/agent_session.js');

const server = {
  name: 'search',
  transport: 'streamable-http',
  toolReference: 'mcp:published-search',
};

test('MCP timeout omission stays absent while explicit zero retains presence for validation', () => {
  const legacy = McpServerRuntime.fromPartial(server);
  const legacyBytes = McpServerRuntime.encode(legacy).finish();
  const decoded = McpServerRuntime.decode(legacyBytes);
  assert.equal(decoded.timeoutMs, undefined);
  assert.equal(Object.hasOwn(McpServerRuntime.toJSON(decoded), 'timeoutMs'), false);
  assert.deepEqual(McpServerRuntime.encode(decoded).finish(), legacyBytes);

  const explicitZero = McpServerRuntime.fromJSON({ ...server, timeoutMs: 0 });
  const decodedZero = McpServerRuntime.decode(McpServerRuntime.encode(explicitZero).finish());
  assert.equal(decodedZero.timeoutMs, 0);
  assert.equal(McpServerRuntime.toJSON(decodedZero).timeoutMs, 0);
});
