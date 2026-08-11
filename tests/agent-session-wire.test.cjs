const assert = require("node:assert/strict");
const test = require("node:test");

const contracts = require("../dist/gen/ts/port/api/v1/agent_session.js");
const {
  AgentSessionServiceService,
  BootstrapPublishedRequest,
  BootstrapPublishedResponse,
  OrchestrationMode,
  ContextPolicy,
} = contracts;

test("the worker contract exposes only canonical publication bootstrap", () => {
  assert.deepEqual(Object.keys(AgentSessionServiceService), ["bootstrapPublished"]);
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
    contractRevision: "execution-publication-2026-08-11-r1",
  });
  assert.deepEqual(
    BootstrapPublishedRequest.decode(BootstrapPublishedRequest.encode(request).finish()),
    request,
  );

  const response = BootstrapPublishedResponse.create({
    contractRevision: "execution-publication-2026-08-11-r1",
    conversationId: request.conversationId,
    sessionId: request.sessionId,
    publishedId: request.publishedId,
    agent: {
      runtime: {
        agentPublishedId: request.publishedId,
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
  assert.equal(decoded.agent.runtime.agentVersionId, undefined);
  assert.equal(decoded.agent.runtime.knowledgeRetrievalCapability, "signed-capability");
});

test("published orchestration topology references only Agent publication IDs", () => {
  const response = BootstrapPublishedResponse.create({
    contractRevision: "execution-publication-2026-08-11-r1",
    conversationId: "conversation-2",
    sessionId: "session-2",
    publishedId: "orchestration-publication-1",
    orchestration: {
      mode: OrchestrationMode.ORCHESTRATION_MODE_HANDOFF,
      agentRuntimes: [
        runtime("agent-publication-1", "Start."),
        runtime("agent-publication-2", "Finish."),
      ],
      handoff: {
        entryAgentPublishedId: "agent-publication-1",
        maxHandoffDepth: 2,
        routes: [{
          transitionId: "route-1",
          sourceAgentPublishedId: "agent-publication-1",
          targetAgentPublishedId: "agent-publication-2",
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
    decoded.orchestration.agentRuntimes.map((entry) => entry.agentPublishedId),
    ["agent-publication-1", "agent-publication-2"],
  );
});

function runtime(agentPublishedId, systemPrompt) {
  return {
    agentPublishedId,
    llmWorker: { apiKey: `key-${agentPublishedId}`, model: "model-1" },
    instructions: { systemPrompt },
    contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION,
  };
}
