const assert = require("node:assert/strict");
const test = require("node:test");

const contracts = require("../dist/gen/ts/port/api/v1/agent_session.js");
const {
  ExecutionSessionServiceService,
  BootstrapPublishedRequest,
  BootstrapPublishedResponse,
  CallRuntimeSnapshot,
  OrchestrationMode,
  ContextPolicy,
  HandoffParameterType,
  PublishedPromptAgentRuntime,
  PublishedInlinePromptRuntime,
} = contracts;

const publicationRevision = "execution-publication-2026-08-27-r1";

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
      contractRevision: "execution-publication-2026-08-27-r1",
    });
    const decoded = BootstrapPublishedRequest.decode(BootstrapPublishedRequest.encode(request).finish());
    assert.deepEqual(decoded, request);
    assert.equal(decoded.admission.sip.phoneNumber, phoneNumber);
  }
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

test("the worker contract exposes only canonical publication bootstrap", () => {
  assert.deepEqual(Object.keys(ExecutionSessionServiceService), ["bootstrapPublished"]);
  assert.equal(contracts.AgentSessionServiceService, undefined);
  assert.equal(contracts.BootstrapAgentRequest, undefined);
  assert.equal(contracts.BootstrapOrchestrationRequest, undefined);
  assert.equal(contracts.BootstrapSipRequest, undefined);
});

test("published bootstrap preserves the publication-only direct text branch", () => {
  const request = BootstrapPublishedRequest.create({
    admission: { webrtcTicket: "ticket-1" },
    conversationId: "conversation-1",
    sessionId: "session-1",
    publishedId: "publication-1",
    contractRevision: "execution-publication-2026-08-27-r1",
  });
  assert.deepEqual(
    BootstrapPublishedRequest.decode(BootstrapPublishedRequest.encode(request).finish()),
    request,
  );

  const response = BootstrapPublishedResponse.create({
    contractRevision: "execution-publication-2026-08-27-r1",
    conversationId: request.conversationId,
    sessionId: request.sessionId,
    publishedId: request.publishedId,
    promptAgent: {
      runtime: {
        promptAgentPublishedId: request.publishedId,
        llmWorker: { apiKey: "runtime-key", model: "model-1" },
        instructions: { systemPrompt: "Help." },
        contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION,
        knowledgeRevisionId: "knowledge-revision-1",
        knowledgeRetrievalCapability: "signed-capability",
      },
    },
    textRuntime: {
      transport: "text_stream",
      roomName: "room-1",
      participantIdentity: "participant-1",
      idleTimeoutSeconds: 300,
      maxSessionDurationSeconds: 3600,
    },
  });
  const decoded = BootstrapPublishedResponse.decode(
    BootstrapPublishedResponse.encode(response).finish(),
  );
  assert.deepEqual(decoded, response);
  assert.equal(decoded.orchestration, undefined);
  assert.equal(decoded.voiceRuntime, undefined);
  assert.equal(decoded.promptAgent.runtime.agentVersionId, undefined);
  assert.equal(decoded.promptAgent.runtime.knowledgeRetrievalCapability, "signed-capability");
});

test("published runtimes round-trip configurable knowledge function metadata", () => {
  const promptRuntime = PublishedPromptAgentRuntime.create({
    knowledgeFunctionName: "search_catalog",
    knowledgeDescription: "Search the product catalog.",
  });
  assert.deepEqual(
    [...PublishedPromptAgentRuntime.encode(promptRuntime).finish()],
    [0x6a, 0x0e, ...Buffer.from("search_catalog"), 0x72, 0x1b, ...Buffer.from("Search the product catalog.")],
  );

  const inlineRuntimeMetadata = PublishedInlinePromptRuntime.create({
    knowledgeFunctionName: "search_orders",
    knowledgeDescription: "Search order history.",
  });
  assert.deepEqual(
    [...PublishedInlinePromptRuntime.encode(inlineRuntimeMetadata).finish()],
    [0x62, 0x0d, ...Buffer.from("search_orders"), 0x6a, 0x15, ...Buffer.from("Search order history.")],
  );

  const response = BootstrapPublishedResponse.create({
    contractRevision: publicationRevision,
    conversationId: "conversation-knowledge-function",
    sessionId: "session-knowledge-function",
    publishedId: "publication-knowledge-function",
    promptAgent: {
      runtime: {
        promptAgentPublishedId: "publication-knowledge-function",
        llmWorker: { apiKey: "runtime-key", model: "model-1" },
        instructions: { systemPrompt: "Help." },
        knowledgeFunctionName: "search_catalog",
        knowledgeDescription: "Search the product catalog.",
      },
    },
    orchestration: {
      mode: OrchestrationMode.ORCHESTRATION_MODE_HANDOFF,
      nodeRuntimes: [
        inlineRuntime("node-1", "Start.", undefined, undefined, "search_orders", "Search order history."),
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
  assert.equal(decoded.promptAgent.runtime.knowledgeFunctionName, "search_catalog");
  assert.equal(decoded.promptAgent.runtime.knowledgeDescription, "Search the product catalog.");
  assert.equal(decoded.orchestration.nodeRuntimes[0].knowledgeFunctionName, "search_orders");
  assert.equal(decoded.orchestration.nodeRuntimes[0].knowledgeDescription, "Search order history.");
});

test("published orchestration topology references only inline node IDs", () => {
  const response = BootstrapPublishedResponse.create({
    contractRevision: "execution-publication-2026-08-27-r1",
    conversationId: "conversation-2",
    sessionId: "session-2",
    publishedId: "orchestration-publication-1",
    orchestration: {
      mode: OrchestrationMode.ORCHESTRATION_MODE_HANDOFF,
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
    decoded.orchestration.nodeRuntimes.map((entry) => entry.nodeId),
    ["node-1", "node-2"],
  );
  assert.equal(decoded.orchestration.nodeRuntimes[0].greeting, undefined);
  assert.equal(decoded.orchestration.nodeRuntimes[0].guardrails, undefined);
  assert.equal(decoded.orchestration.nodeRuntimes[0].knowledgeRevisionId, "");
  assert.equal(decoded.orchestration.nodeRuntimes[0].knowledgeRetrievalCapability, "");
});

test("inline runtimes round-trip Knowledge fields and default them for legacy payloads", () => {
  const response = BootstrapPublishedResponse.create({
    contractRevision: "execution-publication-2026-08-27-r1",
    conversationId: "conversation-3",
    sessionId: "session-3",
    publishedId: "orchestration-publication-2",
    orchestration: {
      mode: OrchestrationMode.ORCHESTRATION_MODE_HANDOFF,
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
  assert.equal(decoded.orchestration.nodeRuntimes[0].knowledgeRevisionId, "knowledge-revision-1");
  assert.equal(decoded.orchestration.nodeRuntimes[0].knowledgeRetrievalCapability, "signed-capability");
  assert.equal(decoded.orchestration.nodeRuntimes[1].knowledgeRevisionId, "");
  assert.equal(decoded.orchestration.nodeRuntimes[1].knowledgeRetrievalCapability, "");
});

test("handoff routes round-trip typed parameters, recent context, and request-start", () => {
  assert.equal(contracts.HandoffContextMode, undefined);
  const response = BootstrapPublishedResponse.create({
    contractRevision: publicationRevision,
    conversationId: "conversation-handoff",
    sessionId: "session-handoff",
    publishedId: "orchestration-handoff",
    orchestration: {
      mode: OrchestrationMode.ORCHESTRATION_MODE_HANDOFF,
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
  const route = decoded.orchestration.handoff.routes[0];
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
