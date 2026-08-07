const assert = require("node:assert/strict");
const test = require("node:test");

const {
  BootstrapResponse,
  BootstrapAgentResponse,
  BootstrapOrchestrationResponse,
  BackgroundAudioPreset,
  DtmfInputRuntime,
  OrchestrationMode,
  NodeKind,
  TransitionKind,
  ContextPolicy,
  SttRuntime,
  TtsRuntime,
  CallTransportSource,
  NoiseCancellationMode,
} = require("../dist/gen/ts/port/api/v1/agent_session.js");

function createPinnedCallRuntime() {
  return {
    stt: { apiKey: "stt-key", model: "stt-model", language: "ko" },
    tts: { apiKey: "tts-key", model: "tts-model", language: "ko", voiceId: "voice-1" },
    backgroundAudio: { preset: BackgroundAudioPreset.BACKGROUND_AUDIO_PRESET_CONTACT_CENTER, volume: 1 },
    dtmf: DtmfInputRuntime.create({ timeoutSeconds: 10, endKey: "*" }),
    transport: { source: CallTransportSource.CALL_TRANSPORT_SOURCE_WEBRTC, roomName: "room-1", callerParticipantIdentity: "caller-1" },
    vad: { noiseCancellation: NoiseCancellationMode.NOISE_CANCELLATION_MODE_STRONG, recognitionSensitivity: 0.75 },
    speechPolicy: { responseSpeed: 1, allowInterruptions: false },
    limits: { dialWaitTimeSeconds: 90, maxCallDurationSeconds: 900, noAnswerTimeoutSeconds: 300 },
  };
}

function createDirectAgentResponse() {
  return BootstrapAgentResponse.create({
    contractRevision: "orchestration-2026-08-07-r4",
    schemaVersion: "agent.orchestration.v1",
    conversationId: "conversation-agent-1",
    sessionId: "session-agent-1",
    callRuntime: createPinnedCallRuntime(),
    agentRuntime: {
      agentId: "agent-1",
      agentVersionId: "agent-version-1",
      llmWorker: { apiKey: "llm-key", model: "model-1" },
      instructions: { systemPrompt: "Help." },
      contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION,
    },
  });
}

test("r4 generated symbols and service methods are exported", () => {
  assert.equal(typeof BootstrapAgentResponse?.create, "function");
  assert.equal(typeof BootstrapOrchestrationResponse?.create, "function");
  assert.equal(typeof BackgroundAudioPreset, "object");
  assert.equal(typeof DtmfInputRuntime?.create, "function");
  assert.equal(typeof CallTransportSource, "object");
  assert.equal(typeof NoiseCancellationMode, "object");
  const { AgentSessionServiceService } = require("../dist/gen/ts/port/api/v1/agent_session.js");
  assert.equal(typeof AgentSessionServiceService?.bootstrapAgent, "object");
  assert.equal(typeof AgentSessionServiceService?.bootstrapOrchestration, "object");
});

test("supervisor/worker bootstrap fields survive protobuf wire round-trip", () => {
  const source = BootstrapResponse.create({
    conversationId: "conversation-1",
    sessionId: "session-1",
    source: "text_stream",
    roomName: "room-1",
    agentToolSnapshotId: "legacy-tool-snapshot-1",
    agentId: "supervisor-1",
    supervisorId: "supervisor-1",
    supervisorVersionId: "supervisor-version-1",
    supervisorPersona: {
      displayName: "Supervisor",
      systemPrompt: "Route calls.",
      voiceId: "voice-1",
      language: "ko",
    },
    supervisorConfig: {
      routingInstructions: "Use worker routing descriptions.",
      maxHandoffDepth: 3,
    },
    workers: [
      {
        workerId: "worker-1",
        versionId: "worker-version-1",
        description: "Handles billing questions.",
        routingText: "Use for billing questions.",
        persona: {
          displayName: "Billing Worker",
          systemPrompt: "Help with billing.",
          greeting: "안녕하세요.",
          voiceId: "voice-2",
          language: "ko",
        },
        role: "worker",
        runtimeIdentity: "worker:worker-1",
        toolSnapshotId: "worker-tool-snapshot-1",
      },
    ],
    canvas: {
      snapshotId: "canvas-snapshot-1",
      versionId: "supervisor-version-1",
      schemaVersion: "1",
      nodes: [
        {
          nodeId: "node-1",
          parentNodeId: "",
          position: { x: 10, y: 20 },
          size: { width: 240, height: 120 },
          isEntry: true,
          agent: { agentId: "worker-1" },
        },
      ],
    },
    workerToolSnapshots: [
      {
        snapshotId: "worker-tool-snapshot-1",
        versionId: "supervisor-version-1",
        workerId: "worker-1",
        tools: [
          {
            toolId: "api-tool-1",
            kind: "api",
            name: "lookup_invoice",
            description: "Look up an invoice.",
            api: {
              method: "POST",
              url: "https://api.example.com/invoices",
              requestSchemaJson: "{}",
              responseSchemaJson: "{}",
            },
          },
        ],
      },
    ],
    bootstrapSnapshotId: "bootstrap-snapshot-1",
    apiToolRuntimes: [
      {
        toolId: "api-tool-1",
        headers: { authorization: "Bearer short-lived-token" },
      },
    ],
  });

  const decoded = BootstrapResponse.decode(BootstrapResponse.encode(source).finish());

  assert.deepEqual(decoded, source);
});

test("direct Agent response carries one pinned CallRuntime and AgentRuntime", () => {
  const source = createDirectAgentResponse();
  const decoded = BootstrapAgentResponse.decode(BootstrapAgentResponse.encode(source).finish());
  assert.deepEqual(decoded, source);
  assert.equal(decoded.agentRuntime?.callRuntime, undefined);
});

test("supervisor and handoff responses carry exactly one mode snapshot", () => {
  const direct = createDirectAgentResponse();
  const runtime = createPinnedCallRuntime();
  const supervisor = BootstrapOrchestrationResponse.create({
    contractRevision: "orchestration-2026-08-07-r4",
    schemaVersion: "agent.orchestration.v1",
    conversationId: "conversation-supervisor-1",
    sessionId: "session-supervisor-1",
    orchestrationId: "orchestration-1",
    orchestrationVersionId: "orchestration-version-1",
    mode: OrchestrationMode.ORCHESTRATION_MODE_SUPERVISOR,
    callRuntime: runtime,
    agentRuntimes: [
      { agentId: "agent-1", agentVersionId: "agent-version-supervisor", llmWorker: { apiKey: "llm-key", model: "model-1" }, instructions: { systemPrompt: "Route." }, contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION },
      { agentId: "agent-2", agentVersionId: "agent-version-billing", llmWorker: { apiKey: "llm-key-2", model: "model-2" }, instructions: { systemPrompt: "Billing." }, contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION },
    ],
    supervisor: { supervisorAgentVersionId: "agent-version-supervisor", specialists: [{ relationId: "billing", targetAgentVersionId: "agent-version-billing", routeDescription: "Billing", contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION }] },
  });
  const handoff = BootstrapOrchestrationResponse.create({
    ...supervisor,
    mode: OrchestrationMode.ORCHESTRATION_MODE_HANDOFF,
    supervisor: undefined,
    agentRuntimes: [
      { agentId: "agent-1", agentVersionId: "agent-version-entry", llmWorker: { apiKey: "llm-key", model: "model-1" }, instructions: { systemPrompt: "Route." }, contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION },
      { agentId: "agent-2", agentVersionId: "agent-version-billing", llmWorker: { apiKey: "llm-key-2", model: "model-2" }, instructions: { systemPrompt: "Billing." }, contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION },
    ],
    handoff: { entryAgentVersionId: "agent-version-entry", maxHandoffDepth: 2, routes: [{ transitionId: "to-billing", sourceAgentVersionId: "agent-version-entry", targetAgentVersionId: "agent-version-billing", routingDescription: "Billing", contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION }] },
  });
  for (const source of [supervisor, handoff]) {
    const decoded = BootstrapOrchestrationResponse.decode(BootstrapOrchestrationResponse.encode(source).finish());
    assert.deepEqual(decoded, source);
    assert.ok(decoded.callRuntime?.backgroundAudio);
    assert.ok(decoded.callRuntime?.dtmf);
    assert.equal(Boolean(decoded.supervisor) !== Boolean(decoded.handoff), true);
    assert.ok(decoded.agentRuntimes?.length);
    assert.equal(decoded.agentRuntimes[0]?.callRuntime, undefined);
    assert.deepEqual(decoded.callRuntime, direct.callRuntime);
  }
});

test("direct, supervisor, and handoff wire fixtures share the complete CallRuntimeSnapshot", () => {
  const direct = createDirectAgentResponse();
  const supervisor = BootstrapOrchestrationResponse.create({
    contractRevision: "orchestration-2026-08-07-r4", schemaVersion: "agent.orchestration.v1",
    conversationId: "conversation-supervisor-2", sessionId: "session-supervisor-2", orchestrationId: "orchestration-2",
    orchestrationVersionId: "orchestration-version-2", mode: OrchestrationMode.ORCHESTRATION_MODE_SUPERVISOR,
    callRuntime: direct.callRuntime, agentRuntimes: [], supervisor: { supervisorAgentVersionId: "agent-version-1", specialists: [] },
  });
  const handoff = BootstrapOrchestrationResponse.create({ ...supervisor, mode: OrchestrationMode.ORCHESTRATION_MODE_HANDOFF, supervisor: undefined, handoff: { entryAgentVersionId: "agent-version-1", maxHandoffDepth: 1, routes: [] } });
  for (const source of [direct, supervisor, handoff]) {
    const runtime = source.callRuntime;
    assert.deepEqual(runtime, createPinnedCallRuntime());
    assert.equal(runtime.transport?.source, CallTransportSource.CALL_TRANSPORT_SOURCE_WEBRTC);
    assert.equal(runtime.vad?.recognitionSensitivity, 0.75);
    assert.equal(runtime.speechPolicy?.responseSpeed, 1);
    assert.equal(runtime.speechPolicy?.allowInterruptions, false);
    assert.deepEqual(runtime.limits, { dialWaitTimeSeconds: 90, maxCallDurationSeconds: 900, noAnswerTimeoutSeconds: 300 });
  }
});

test("complete CallRuntimeSnapshot preserves optional scalar presence and all transport source sentinels", () => {
  for (const source of [CallTransportSource.CALL_TRANSPORT_SOURCE_WEBRTC, CallTransportSource.CALL_TRANSPORT_SOURCE_SIP, CallTransportSource.CALL_TRANSPORT_SOURCE_TEXT_STREAM]) {
    const runtime = createPinnedCallRuntime();
    runtime.transport.source = source;
    runtime.speechPolicy.responseSpeed = 0;
    runtime.speechPolicy.allowInterruptions = true;
    const decoded = BootstrapAgentResponse.decode(BootstrapAgentResponse.encode(BootstrapAgentResponse.create({ ...createDirectAgentResponse(), callRuntime: runtime })).finish());
    assert.equal(decoded.callRuntime.transport.source, source);
    assert.equal(decoded.callRuntime.speechPolicy.responseSpeed, 0);
    assert.equal(decoded.callRuntime.speechPolicy.allowInterruptions, true);
    assert.equal(Object.prototype.hasOwnProperty.call(decoded.callRuntime.speechPolicy, "responseSpeed"), true);
    assert.equal(Object.prototype.hasOwnProperty.call(decoded.callRuntime.speechPolicy, "allowInterruptions"), true);
  }
});

test("orchestration graph fields survive protobuf wire round-trip", () => {
  const source = BootstrapResponse.create({
    conversationId: "conversation-2",
    sessionId: "session-2",
    source: "text_stream",
    roomName: "room-2",
    agentToolSnapshotId: "legacy-tool-snapshot-2",
    agentId: "agent-1",
    orchestrationGraph: {
      snapshotId: "graph-snapshot-1",
      versionId: "graph-version-1",
      schemaVersion: "agent.orchestration.v1",
      entryNodeId: "agent-node-1",
      maxHandoffDepth: 4,
      nodes: [{
        nodeId: "agent-node-1",
        kind: NodeKind.NODE_KIND_AGENT,
        position: { x: 1, y: 2 },
        size: { width: 100, height: 80 },
        agent: {
          agentId: "agent-1",
          agentVersionId: "agent-version-1",
          persona: { displayName: "Agent", systemPrompt: "Help." },
          executionProfile: { llmModel: "model-1", ttsModel: "tts-1", voiceId: "voice-1", language: "en" },
          toolSnapshotId: "node-tools-1",
        },
      }, {
        nodeId: "task-node-1",
        kind: NodeKind.NODE_KIND_TASK,
        position: { x: 2, y: 3 },
        size: { width: 100, height: 80 },
        task: {
          name: "Lookup",
          instructions: "Look it up.",
          completionInstructions: "Report the result.",
          executionProfile: { llmModel: "model-2" },
          toolSnapshotId: "node-tools-2",
        },
      }, {
        nodeId: "agent-node-2",
        kind: NodeKind.NODE_KIND_AGENT,
        position: { x: 4, y: 5 },
        size: { width: 100, height: 80 },
        agent: {
          agentId: "agent-2",
          agentVersionId: "agent-version-2",
          persona: { displayName: "Agent Two", systemPrompt: "Continue." },
          executionProfile: { llmModel: "model-2" },
          toolSnapshotId: "node-tools-3",
        },
      }, {
        nodeId: "group-node-1",
        kind: NodeKind.NODE_KIND_GROUP,
        position: { x: 3, y: 4 },
        size: { width: 300, height: 200 },
        group: { label: "Operations" },
      }],
      transitions: [{
        transitionId: "transition-1",
        sourceNodeId: "agent-node-1",
        targetNodeId: "task-node-1",
        kind: TransitionKind.TRANSITION_KIND_DELEGATE,
        description: "Look up information.",
        contextPolicy: ContextPolicy.CONTEXT_POLICY_CONVERSATION,
        announcement: "I will look that up.",
      }, {
        transitionId: "transition-2",
        sourceNodeId: "agent-node-1",
        targetNodeId: "agent-node-2",
        kind: TransitionKind.TRANSITION_KIND_HANDOFF,
        description: "Hand off to another agent.",
        contextPolicy: ContextPolicy.CONTEXT_POLICY_NONE,
      }],
      nodeToolSnapshots: [{
        snapshotId: "node-tools-1",
        versionId: "graph-version-1",
        nodeId: "agent-node-1",
        tools: [{
          toolId: "domain-tool-1",
          kind: "api",
          name: "lookup",
          api: { method: "GET", url: "https://api.example.com/lookup" },
        }],
      }, {
        snapshotId: "node-tools-2",
        versionId: "graph-version-1",
        nodeId: "task-node-1",
        tools: [],
      }, {
        snapshotId: "node-tools-3",
        versionId: "graph-version-1",
        nodeId: "agent-node-2",
        tools: [],
      }],
    },
  });

  const graphNodeIds = new Set(source.orchestrationGraph.nodes.map((node) => node.nodeId));
  for (const transition of source.orchestrationGraph.transitions) {
    assert.ok(graphNodeIds.has(transition.sourceNodeId), `missing transition source ${transition.sourceNodeId}`);
    assert.ok(graphNodeIds.has(transition.targetNodeId), `missing transition target ${transition.targetNodeId}`);
  }
  const toolSnapshots = new Map(source.orchestrationGraph.nodeToolSnapshots.map((snapshot) => [snapshot.snapshotId, snapshot]));
  for (const node of source.orchestrationGraph.nodes) {
    const toolSnapshotId = node.agent?.toolSnapshotId ?? node.task?.toolSnapshotId;
    if (toolSnapshotId) {
      const snapshot = toolSnapshots.get(toolSnapshotId);
      assert.ok(snapshot, `missing tool snapshot ${toolSnapshotId}`);
      assert.equal(snapshot.nodeId, node.nodeId, `tool snapshot ${toolSnapshotId} belongs to ${snapshot.nodeId}, not ${node.nodeId}`);
    }
  }

  // This fixture proves protobuf wire preservation; Go tests own protovalidate coverage.
  const decoded = BootstrapResponse.decode(BootstrapResponse.encode(source).finish());
  assert.equal(decoded.orchestrationGraph?.snapshotId, "graph-snapshot-1");
  assert.deepEqual(decoded, source);
});
