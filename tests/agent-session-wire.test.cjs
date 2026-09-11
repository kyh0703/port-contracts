const assert = require("node:assert/strict");
const test = require("node:test");

const contracts = require("../dist/gen/ts/port/api/v1/agent_session.js");
const {
  ExecutionSessionServiceService,
  BootstrapPublishedRequest,
  BootstrapPublishedResponse,
  CallRuntimeSnapshot,
  ConversationControlRuntime,
  TimeElapsedActionRuntime,
  EndCallActionRuntime,
  AgentMode,
  ContextPolicy,
  HandoffParameterType,
  PublishedAgentNodeRuntime,
  KnowledgeToolRuntime,
  EndCallTool,
  TransferToHumanTool,
  BuiltInTool,
  DtmfTool,
  SendSmsTool,
} = contracts;

const publicationRevision = "execution-publication-2026-09-04-r1";

test("Speaker preserves the exact script and consent settings on the wire", () => {
  const config = {
    condition: "계약 내용을 고지해야 할 때",
    script: "  제1조. 계약 내용입니다.\n\n금액: 10,000원.  ",
    consentQuestion: " 위 내용에 동의하십니까? ",
    responseTimeoutSeconds: 30,
  };
  const tool = BuiltInTool.fromJSON({ speaker: config });
  const decoded = BuiltInTool.decode(BuiltInTool.encode(tool).finish());
  assert.deepEqual(decoded.speaker, config);
  assert.deepEqual(BuiltInTool.toJSON(decoded).speaker, config);
});

test("DTMF and SMS built-in tools round-trip their additive runtime payloads", () => {
  const dtmf = BuiltInTool.create({ dtmf: DtmfTool.create({}) });
  const sms = BuiltInTool.create({
    sendSms: SendSmsTool.create({
      recipient: "{{caller_number}}",
      template: "안녕하세요 {{name}}님",
      maxSends: 3,
      condition: "사용자가 안내 문자를 요청한 경우",
    }),
  });

  assert.deepEqual(BuiltInTool.decode(BuiltInTool.encode(dtmf).finish()), dtmf);
  assert.deepEqual(BuiltInTool.decode(BuiltInTool.encode(sms).finish()), sms);
});

test("built-in tool conditions round-trip while legacy payloads default to empty", () => {
  const legacyEndCall = EndCallTool.create({});
  const legacyTransfer = TransferToHumanTool.create({
    sipCallTo: "+821012345678",
    ringingTimeoutMs: 30000,
  });
  assert.equal(EndCallTool.decode(EndCallTool.encode(legacyEndCall).finish()).condition, "");
  assert.equal(
    TransferToHumanTool.decode(TransferToHumanTool.encode(legacyTransfer).finish()).condition,
    "",
  );

  const endCall = EndCallTool.create({ condition: "사용자가 상담을 종료해 달라고 요청한 경우", confirm: true });
  const transfer = TransferToHumanTool.create({
    sipCallTo: "+821012345678",
    ringingTimeoutMs: 30000,
    condition: "사용자가 상담원 연결을 요청한 경우",
  });
  assert.equal(EndCallTool.decode(EndCallTool.encode(endCall).finish()).condition, endCall.condition);
  assert.equal(
    TransferToHumanTool.decode(TransferToHumanTool.encode(transfer).finish()).condition,
    transfer.condition,
  );
});

test("SIP caller phone number is optional and round-trips without changing the revision", () => {
  for (const phoneNumber of [undefined, "+821012345678", "anonymous"]) {
    const request = BootstrapPublishedRequest.create({
      admission: {
        sip: {
          jobId: "job-1",
          dispatchId: "dispatch-1",
          roomName: "room-1",
          participantIdentity: "participant-1",
          trunkId: "trunk-1",
          trunkPhoneNumber: "+821012300000",
          callIdFull: "call-1",
          phoneNumber,
        },
      },
      conversationId: "conversation-1",
      sessionId: "session-1",
      publishedId: "publication-1",
      contractRevision: publicationRevision,
    });
    const decoded = BootstrapPublishedRequest.decode(BootstrapPublishedRequest.encode(request).finish());
    assert.deepEqual(decoded, request);
    assert.equal(decoded.admission.sip.phoneNumber, phoneNumber);
  }
});

test("session prompt variables round-trip dotted system names and primitive values", () => {
  const promptVariables = {
    system: [
      { name: "customer.number", stringValue: "+821012345678" },
      { name: "agent.number", stringValue: "+82212345678" },
      { name: "agent.id", stringValue: "agent-1" },
      { name: "conversation.id", stringValue: "conversation-1" },
      { name: "conversation.channel", stringValue: "phone" },
      { name: "date_iso", stringValue: "2026-09-04" },
      { name: "retry_count", numberValue: 2 },
      { name: "is_returning", booleanValue: true },
    ],
    user: [{ name: "order.id", stringValue: "order-1" }],
  };
  const response = BootstrapPublishedResponse.create({
    contractRevision: publicationRevision,
    conversationId: "conversation-variables",
    sessionId: "session-variables",
    publishedId: "publication-variables",
    promptVariables,
  });
  const decoded = BootstrapPublishedResponse.decode(
    BootstrapPublishedResponse.encode(response).finish(),
  );

  assert.deepEqual(decoded.promptVariables, response.promptVariables);
  assert.equal(decoded.promptVariables.system[0].name, "customer.number");
  assert.equal(decoded.promptVariables.system[6].numberValue, 2);
  assert.equal(decoded.promptVariables.system[7].booleanValue, true);
  assert.equal(decoded.promptVariables.user[0].stringValue, "order-1");
});

test("call runtime filler settings are optional and preserve the configured phrase", () => {
  const disabled = CallRuntimeSnapshot.create({});
  const disabledDecoded = CallRuntimeSnapshot.decode(CallRuntimeSnapshot.encode(disabled).finish());
  assert.deepEqual(disabledDecoded, disabled);
  assert.equal(disabledDecoded.conversationFiller, undefined);

  const enabled = CallRuntimeSnapshot.create({
    conversationFiller: { phrase: "One moment while I look that up." },
  });
  const enabledDecoded = CallRuntimeSnapshot.decode(CallRuntimeSnapshot.encode(enabled).finish());
  assert.deepEqual(enabledDecoded, enabled);
  assert.equal(enabledDecoded.conversationFiller.phrase, "One moment while I look that up.");
});

test("conversation controls round-trip end-call policies and elapsed actions", () => {
  const controls = ConversationControlRuntime.create({
    endCallMessage: "상담을 종료하겠습니다.",
    endCallPhrases: ["감사합니다", "통화 종료"],
    timeElapsedActions: [
      { atSeconds: 300, say: "곧 상담을 마무리하겠습니다." },
      { atSeconds: 360, endCall: EndCallActionRuntime.create({}) },
    ],
  });
  const runtime = CallRuntimeSnapshot.create({ conversationControl: controls });
  const decoded = CallRuntimeSnapshot.decode(CallRuntimeSnapshot.encode(runtime).finish());
  assert.deepEqual(decoded, runtime);
  assert.equal(decoded.conversationControl.endCallMessage, "상담을 종료하겠습니다.");
  assert.equal(decoded.conversationControl.timeElapsedActions[0].say, "곧 상담을 마무리하겠습니다.");
  assert.ok(decoded.conversationControl.timeElapsedActions[1].endCall);
});

test("the worker contract exposes canonical bootstrap and session-bound transfer control", () => {
  assert.deepEqual(Object.keys(ExecutionSessionServiceService), ["bootstrapPublished", "commandSipTransfer"]);
  assert.equal(contracts.AgentSessionServiceService, undefined);
  assert.equal(contracts.BootstrapAgentRequest, undefined);
  assert.equal(contracts.BootstrapSipRequest, undefined);
});

test("published runtimes round-trip configurable knowledge function metadata", () => {
  const promptRuntime = PublishedAgentNodeRuntime.create({
    knowledgeFunctionName: "search_catalog",
    knowledgeDescription: "Search the product catalog.",
  });
  assert.deepEqual(
    [...PublishedAgentNodeRuntime.encode(promptRuntime).finish()],
    [0x62, 0x0e, ...Buffer.from("search_catalog"), 0x6a, 0x1b, ...Buffer.from("Search the product catalog.")],
  );

  const inlineRuntimeMetadata = PublishedAgentNodeRuntime.create({
    knowledgeFunctionName: "search_orders",
    knowledgeDescription: "Search order history.",
  });
  assert.deepEqual(
    [...PublishedAgentNodeRuntime.encode(inlineRuntimeMetadata).finish()],
    [0x62, 0x0d, ...Buffer.from("search_orders"), 0x6a, 0x15, ...Buffer.from("Search order history.")],
  );

  const response = BootstrapPublishedResponse.create({
    contractRevision: publicationRevision,
    conversationId: "conversation-knowledge-function",
    sessionId: "session-knowledge-function",
    publishedId: "publication-knowledge-function",
    agent: {
      mode: AgentMode.AGENT_MODE_HANDOFF,
      nodeRuntimes: [
        inlineRuntime("node-1", "Start.", undefined, undefined, "search_catalog", "Search the product catalog."),
        inlineRuntime("node-2", "Finish."),
      ],
      handoff: {
        entryNodeId: "node-1",
        maxHandoffDepth: 2,
        routes: [{
          transitionId: "route-1",
          sourceNodeId: "node-1",
          targetNodeId: "node-2",
          routingDescription: "Finish",
          contextPolicy: ContextPolicy.CONTEXT_POLICY_NONE,
        }],
      },
    },
  });

  const decoded = BootstrapPublishedResponse.decode(
    BootstrapPublishedResponse.encode(response).finish(),
  );
  assert.equal(decoded.agent.nodeRuntimes[0].knowledgeFunctionName, "search_catalog");
  assert.equal(decoded.agent.nodeRuntimes[0].knowledgeDescription, "Search the product catalog.");
  assert.equal(decoded.agent.nodeRuntimes[0].knowledgeFunctionName, "search_catalog");
  assert.equal(decoded.agent.nodeRuntimes[0].knowledgeDescription, "Search the product catalog.");
});

test("published agent topology references only inline node IDs", () => {
  const response = BootstrapPublishedResponse.create({
    contractRevision: publicationRevision,
    conversationId: "conversation-2",
    sessionId: "session-2",
    publishedId: "agent-publication-1",
    agent: {
      mode: AgentMode.AGENT_MODE_HANDOFF,
      nodeRuntimes: [
        inlineRuntime("node-1", "Start."),
        inlineRuntime("node-2", "Finish."),
      ],
      handoff: {
        entryNodeId: "node-1",
        maxHandoffDepth: 2,
        routes: [{
          transitionId: "route-1",
          sourceNodeId: "node-1",
          targetNodeId: "node-2",
          routingDescription: "Escalate",
          contextPolicy: ContextPolicy.CONTEXT_POLICY_RECENT,
        }],
      },
    },
    textRuntime: {
      transport: "text_stream",
      roomName: "room-2",
      participantIdentity: "participant-2",
      idleTimeoutSeconds: 300,
      maxSessionDurationSeconds: 3600,
    },
  });

  const decoded = BootstrapPublishedResponse.decode(
    BootstrapPublishedResponse.encode(response).finish(),
  );
  assert.deepEqual(decoded, response);
  assert.deepEqual(
    decoded.agent.nodeRuntimes.map((entry) => entry.nodeId),
    ["node-1", "node-2"],
  );
  assert.equal(decoded.agent.nodeRuntimes[0].greeting, undefined);
  assert.equal(decoded.agent.nodeRuntimes[0].guardrails, undefined);
  assert.equal(decoded.agent.nodeRuntimes[0].knowledgeRevisionId, "");
  assert.equal(decoded.agent.nodeRuntimes[0].knowledgeRetrievalCapability, "");
});

test("inline runtimes round-trip Knowledge fields and default them for legacy payloads", () => {
  const response = BootstrapPublishedResponse.create({
    contractRevision: publicationRevision,
    conversationId: "conversation-3",
    sessionId: "session-3",
    publishedId: "agent-publication-2",
    agent: {
      mode: AgentMode.AGENT_MODE_HANDOFF,
      nodeRuntimes: [
        inlineRuntime("node-1", "Start.", "knowledge-revision-1", "signed-capability"),
        inlineRuntime("node-2", "Finish."),
      ],
      handoff: {
        entryNodeId: "node-1",
        maxHandoffDepth: 2,
        routes: [{
          transitionId: "route-1",
          sourceNodeId: "node-1",
          targetNodeId: "node-2",
          routingDescription: "Escalate",
          contextPolicy: ContextPolicy.CONTEXT_POLICY_NONE,
        }],
      },
    },
    textRuntime: {
      transport: "text_stream",
      roomName: "room-3",
      participantIdentity: "participant-3",
      idleTimeoutSeconds: 300,
      maxSessionDurationSeconds: 3600,
    },
  });

  const decoded = BootstrapPublishedResponse.decode(
    BootstrapPublishedResponse.encode(response).finish(),
  );
  assert.deepEqual(decoded, response);
  assert.equal(decoded.agent.nodeRuntimes[0].knowledgeRevisionId, "knowledge-revision-1");
  assert.equal(decoded.agent.nodeRuntimes[0].knowledgeRetrievalCapability, "signed-capability");
  assert.equal(decoded.agent.nodeRuntimes[1].knowledgeRevisionId, "");
  assert.equal(decoded.agent.nodeRuntimes[1].knowledgeRetrievalCapability, "");
});

test("handoff routes round-trip typed parameters, recent context, and request-start", () => {
  assert.equal(contracts.HandoffContextMode, undefined);
  const response = BootstrapPublishedResponse.create({
    contractRevision: publicationRevision,
    conversationId: "conversation-handoff",
    sessionId: "session-handoff",
    publishedId: "agent-handoff",
    agent: {
      mode: AgentMode.AGENT_MODE_HANDOFF,
      nodeRuntimes: [inlineRuntime("intake", "Intake."), inlineRuntime("refund", "Refund.")],
      handoff: {
        entryNodeId: "intake",
        maxHandoffDepth: 2,
        routes: [{
          transitionId: "route-refund",
          sourceNodeId: "intake",
          targetNodeId: "refund",
          routingDescription: "Refund request",
          contextPolicy: ContextPolicy.CONTEXT_POLICY_RECENT,
          requestStart: "I will transfer you to refunds.",
          parameters: [
            {
              name: "reason",
              type: HandoffParameterType.HANDOFF_PARAMETER_TYPE_STRING,
              description: "Refund reason",
              required: true,
              stringEnum: ["duplicate", "wrong-item"],
            },
            {
              name: "amount",
              type: HandoffParameterType.HANDOFF_PARAMETER_TYPE_NUMBER,
              numberEnum: [10.5, 20],
            },
            {
              name: "urgent",
              type: HandoffParameterType.HANDOFF_PARAMETER_TYPE_BOOLEAN,
              booleanEnum: [true, false],
            },
          ],
        }],
      },
    },
    textRuntime: {
      transport: "text_stream",
      roomName: "room-handoff",
      participantIdentity: "participant-handoff",
      idleTimeoutSeconds: 300,
      maxSessionDurationSeconds: 3600,
    },
  });

  const decoded = BootstrapPublishedResponse.decode(
    BootstrapPublishedResponse.encode(response).finish(),
  );
  assert.deepEqual(decoded, response);
  const route = decoded.agent.handoff.routes[0];
  assert.equal(route.contextPolicy, ContextPolicy.CONTEXT_POLICY_RECENT);
  assert.equal(route.requestStart, "I will transfer you to refunds.");
  assert.equal(route.announcement, "");
  assert.deepEqual(route.parameters[0].stringEnum, ["duplicate", "wrong-item"]);
  assert.deepEqual(route.parameters[1].numberEnum, [10.5, 20]);
  assert.deepEqual(route.parameters[2].booleanEnum, [true, false]);
});

test("field-6 bytes decode into announcement", () => {
  const route = contracts.PublishedHandoffRoute.decode(Uint8Array.from([
    0x0a, 0x07, 0x72, 0x6f, 0x75, 0x74, 0x65, 0x2d, 0x31,
    0x12, 0x05, 0x73, 0x72, 0x63, 0x2d, 0x31,
    0x1a, 0x05, 0x64, 0x73, 0x74, 0x2d, 0x31,
    0x22, 0x08, 0x45, 0x73, 0x63, 0x61, 0x6c, 0x61, 0x74, 0x65,
    0x28, 0x03,
    0x32, 0x10, 0x54, 0x72, 0x61, 0x6e, 0x73, 0x66, 0x65, 0x72, 0x20, 0x73, 0x74, 0x61, 0x72, 0x74, 0x65, 0x64,
  ]));

  assert.equal(route.announcement, "Transfer started");
  assert.equal(route.requestStart, "");
});

test("handoff route system prompt is optional and round-trips on field 9", () => {
  const withoutPrompt = contracts.PublishedHandoffRoute.create({});
  assert.equal(withoutPrompt.systemPrompt, undefined);

  const route = contracts.PublishedHandoffRoute.create({
    systemPrompt: "Continue without greeting the caller.",
  });
  const decoded = contracts.PublishedHandoffRoute.decode(
    contracts.PublishedHandoffRoute.encode(route).finish(),
  );
  assert.equal(decoded.systemPrompt, route.systemPrompt);
});

test("knowledge tools support multiple metadata entries and runtime correlation IDs", () => {
  const promptRuntime = PublishedAgentNodeRuntime.create({
    tools: [
      { toolId: "knowledge-search", kind: "knowledge", name: "Search", knowledge: { knowledgeRevisionId: "rev-1" } },
      { toolId: "knowledge-faq", kind: "knowledge", name: "FAQ", knowledge: { knowledgeRevisionId: "rev-2" } },
    ],
    knowledgeToolRuntimes: [
      { toolId: "knowledge-search", retrievalCapability: "cap-search" },
      { toolId: "knowledge-faq", retrievalCapability: "cap-faq" },
    ],
  });
  const decoded = PublishedAgentNodeRuntime.decode(PublishedAgentNodeRuntime.encode(promptRuntime).finish());
  const encoded = [...PublishedAgentNodeRuntime.encode(promptRuntime).finish()];
  assert.deepEqual(encoded.slice(-58), [
    0x72, 0x1e, 0x0a, 0x10, ...Buffer.from("knowledge-search"),
    0x12, 0x0a, ...Buffer.from("cap-search"),
    0x72, 0x18, 0x0a, 0x0d, ...Buffer.from("knowledge-faq"),
    0x12, 0x07, ...Buffer.from("cap-faq"),
  ]);
  assert.deepEqual(decoded.tools.map((tool) => [tool.toolId, tool.kind, tool.knowledge.knowledgeRevisionId]), [
    ["knowledge-search", "knowledge", "rev-1"],
    ["knowledge-faq", "knowledge", "rev-2"],
  ]);
  assert.deepEqual(decoded.knowledgeToolRuntimes, [
    KnowledgeToolRuntime.create({ toolId: "knowledge-search", retrievalCapability: "cap-search" }),
    KnowledgeToolRuntime.create({ toolId: "knowledge-faq", retrievalCapability: "cap-faq" }),
  ]);

  const inlineRuntimeValue = PublishedAgentNodeRuntime.create({
    knowledgeToolRuntimes: [
      { toolId: "knowledge-search", retrievalCapability: "cap-search" },
      { toolId: "knowledge-faq", retrievalCapability: "cap-faq" },
    ],
  });
  const inlineEncoded = [...PublishedAgentNodeRuntime.encode(inlineRuntimeValue).finish()];
  assert.deepEqual(inlineEncoded, [
    0x72, 0x1e, 0x0a, 0x10, ...Buffer.from("knowledge-search"),
    0x12, 0x0a, ...Buffer.from("cap-search"),
    0x72, 0x18, 0x0a, 0x0d, ...Buffer.from("knowledge-faq"),
    0x12, 0x07, ...Buffer.from("cap-faq"),
  ]);
  assert.deepEqual(PublishedAgentNodeRuntime.decode(Uint8Array.from(inlineEncoded)), inlineRuntimeValue);
});

test("legacy singular knowledge fields retain their field numbers and decode unchanged", () => {
  const inlineBytes = Uint8Array.from([
    0x52, 0x0a, 0x6c, 0x65, 0x67, 0x61, 0x63, 0x79, 0x2d, 0x72, 0x65, 0x76,
    0x5a, 0x0a, 0x6c, 0x65, 0x67, 0x61, 0x63, 0x79, 0x2d, 0x63, 0x61, 0x70,
    0x62, 0x09, 0x6c, 0x65, 0x67, 0x61, 0x63, 0x79, 0x2d, 0x66, 0x6e,
    0x6a, 0x09, 0x6c, 0x65, 0x67, 0x61, 0x63, 0x79, 0x2d, 0x64, 0x65,
  ]);
  const inline = PublishedAgentNodeRuntime.decode(inlineBytes);
  assert.equal(inline.knowledgeRevisionId, "legacy-rev");
  assert.equal(inline.knowledgeRetrievalCapability, "legacy-cap");
  assert.equal(inline.knowledgeFunctionName, "legacy-fn");
  assert.equal(inline.knowledgeDescription, "legacy-de");
  assert.deepEqual([...PublishedAgentNodeRuntime.encode(inline).finish()], [...inlineBytes]);
});

function inlineRuntime(
  nodeId,
  systemPrompt,
  knowledgeRevisionId,
  knowledgeRetrievalCapability,
  knowledgeFunctionName,
  knowledgeDescription,
) {
  return {
    nodeId,
    llmWorker: { apiKey: `key-${nodeId}`, model: "model-1" },
    instructions: { systemPrompt },
    contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION,
    builtInTools: [{ endCall: { closingPhrase: "Goodbye.", confirm: true } }],
    knowledgeRevisionId,
    knowledgeRetrievalCapability,
    knowledgeFunctionName,
    knowledgeDescription,
  };
}

test('inline authoring options preserve explicit zero and absent provider defaults on the wire', () => {
  const empty = PublishedAgentNodeRuntime.decode(PublishedAgentNodeRuntime.encode(PublishedAgentNodeRuntime.fromPartial({ nodeId: 'node' })).finish());
  assert.equal(empty.authoring, undefined);
  const input = PublishedAgentNodeRuntime.fromPartial({ nodeId: 'node', authoring: { model: { temperature: 0, maxTokens: 512 }, toolBindings: [{ toolId: 'tool', parameter: 'id', variable: 'api.lookup.id', target: 'template' }] } });
  const decoded = PublishedAgentNodeRuntime.decode(PublishedAgentNodeRuntime.encode(input).finish());
  assert.equal(decoded.authoring.model.temperature, 0);
  assert.equal(decoded.authoring.model.reasoningEffort, undefined);
  assert.deepEqual(decoded.authoring.toolBindings, input.authoring.toolBindings);
});
