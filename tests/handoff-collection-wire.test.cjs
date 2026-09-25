const assert = require('node:assert/strict');
const test = require('node:test');
const {HandoffParameter, PublishedHandoffRoute, HandoffParameterType} = require('../dist/gen/ts/port/api/v1/agent_session.js');

test('DTMF collection survives an edge parameter wire and JSON round-trip', () => {
  const collection = {input:'dtmf', digits:11, prompt:'휴대폰 번호를 입력해 주세요.', timeoutSeconds:60, confirm:true};
  const route = PublishedHandoffRoute.fromJSON({transitionId:'a-b',sourceNodeId:'a',targetNodeId:'b',parameters:[{name:'휴대폰번호',type:HandoffParameterType.HANDOFF_PARAMETER_TYPE_STRING,required:true,collection}]});
  const decoded = PublishedHandoffRoute.decode(PublishedHandoffRoute.encode(route).finish());
  assert.deepEqual({...decoded.parameters[0].collection, format: undefined},{...collection, format: undefined});
  assert.deepEqual(PublishedHandoffRoute.toJSON(decoded).parameters[0].collection,collection);
});

test('legacy parameters preserve their existing encoding without collection', () => {
  const oldBytes = Uint8Array.from([10,1,120,16,1,32,1]);
  const parameter = HandoffParameter.decode(oldBytes);
  assert.equal(parameter.name,'x');
  assert.equal(parameter.collection,undefined);
  assert.deepEqual(HandoffParameter.encode(parameter).finish(),oldBytes);
});

test('false confirmation and boundary digit counts keep their meaning', () => {
  for (const digits of [1,32]) {
    const parameter = HandoffParameter.fromJSON({name:'code',type:1,required:true,collection:{input:'dtmf',digits,prompt:'코드를 입력해 주세요.',timeoutSeconds:5,confirm:false}});
    const decoded = HandoffParameter.decode(HandoffParameter.encode(parameter).finish());
    assert.equal(decoded.collection.digits,digits);
    assert.equal(decoded.collection.confirm,false);
    assert.equal(decoded.collection.timeoutSeconds,5);
  }
});

test('web form validation format survives publication and worker wire boundaries', () => {
  const collection = {input:'web_form', digits:8, prompt:'생년월일', timeoutSeconds:120, confirm:false, format:'birthdate'};
  const parameter = HandoffParameter.fromJSON({name:'생년월일',type:1,required:true,collection});
  const decoded = HandoffParameter.decode(HandoffParameter.encode(parameter).finish());
  assert.deepEqual(decoded.collection,collection);
  const {CommandFormCollectionRequest, CommandFormCollectionResponse} = require('../dist/gen/ts/port/api/v1/agent_session.js');
  const request = CommandFormCollectionRequest.fromJSON({
    action:'poll',conversationId:'call',sessionId:'session',publishedId:'publication',
    transitionId:'collect',requestId:'be9b537d-0334-4e21-80d8-2dc5773b33dc',
  });
  assert.deepEqual(CommandFormCollectionRequest.decode(CommandFormCollectionRequest.encode(request).finish()),request);
  const response = CommandFormCollectionResponse.fromJSON({
    requestId:request.requestId,status:'completed',delivery:'preview',
    expiresAt:'2026-09-25T12:00:00.000Z',values:{휴대폰번호:'01000000000',생년월일:'19900101'},failureCode:'',
  });
  assert.deepEqual(CommandFormCollectionResponse.decode(CommandFormCollectionResponse.encode(response).finish()),response);
});
