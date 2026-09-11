const assert = require('node:assert/strict');
const test = require('node:test');
const c = require('../dist/gen/ts/port/api/v1/agent_session.js');

test('transfer policy is additive and preserves absent legacy configuration', () => {
  const legacy = c.TransferToHumanTool.decode(c.TransferToHumanTool.encode(c.TransferToHumanTool.create({sipCallTo: '+821012345678', ringingTimeoutMs: 30000})).finish());
  assert.equal(legacy.mode, undefined);
  assert.equal(legacy.consultationTimeoutMs, undefined);
  const policy = c.TransferToHumanTool.create({sipCallTo: '+821012345678', ringingTimeoutMs: 30000, mode: 'consultative', consultationTimeoutMs: 60000});
  assert.equal(c.TransferToHumanTool.decode(c.TransferToHumanTool.encode(policy).finish()).mode, 'consultative');
  assert.equal(c.TransferToHumanTool.decode(c.TransferToHumanTool.encode(policy).finish()).consultationTimeoutMs, 60000);
});

test('admitted worker capability survives bootstrap serialization', () => {
  const response = c.BootstrapPublishedResponse.create({transferCapability: 'session-bound-capability'});
  assert.equal(c.BootstrapPublishedResponse.decode(c.BootstrapPublishedResponse.encode(response).finish()).transferCapability, 'session-bound-capability');
});

test('transfer command preserves consent evidence and private consultation credentials', () => {
  const request = c.CommandSipTransferRequest.create({capability: 'cap', conversationId: 'conversation', sessionId: 'session', requestId: 'command', nodeId: 'node', attemptId: 'attempt', action: 'accept', consentSource: 'voice', reason: '', consultantIdentity: 'consultant', briefing: 'Customer needs support.'});
  assert.deepEqual(c.CommandSipTransferRequest.decode(c.CommandSipTransferRequest.encode(request).finish()), request);
  assert.equal(c.CommandSipTransferRequest.decode(c.CommandSipTransferRequest.encode(request).finish()).consentSource, 'voice');
  const response = c.CommandSipTransferResponse.create({attemptId: 'attempt', state: 'briefing', mode: 'consultative', consultation: {roomName: 'private-room', consultantIdentity: 'consultant', workerIdentity: 'briefing-worker', livekitUrl: 'wss://example.test', participantToken: 'private-token'}, expiresAt: '2026-09-11T06:00:00.000Z', reason: ''});
  assert.deepEqual(c.CommandSipTransferResponse.decode(c.CommandSipTransferResponse.encode(response).finish()), response);
  assert.equal(c.ExecutionSessionServiceService.commandSipTransfer.path, '/port.api.v1.ExecutionSessionService/CommandSipTransfer');
});
