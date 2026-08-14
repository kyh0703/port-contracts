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
} = contracts;

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
    contractRevision: "execution-publication-2026-08-14-r1",
  });
  assert.deepEqual(
    BootstrapPublishedRequest.decode(BootstrapPublishedRequest.encode(request).finish()),
    request,
  );

  const response = BootstrapPublishedResponse.create({
    contractRevision: "execution-publication-2026-08-14-r1",
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

test("published orchestration topology references only inline node IDs", () => {
  const response = BootstrapPublishedResponse.create({
    contractRevision: "execution-publication-2026-08-14-r1",
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
          contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION,
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
  assert.equal(decoded.orchestration.nodeRuntimes[0].knowledgeRevisionId, undefined);
});

function inlineRuntime(nodeId, systemPrompt) {
  return {
    nodeId,
    llmWorker: { apiKey: `key-${nodeId}`, model: "model-1" },
    instructions: { systemPrompt },
    contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION,
    builtInTools: [{ endCall: { closingPhrase: "Goodbye.", confirm: true } }],
  };
}
