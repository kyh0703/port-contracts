const assert = require("node:assert/strict");
const test = require("node:test");

const {
  BootstrapResponse,
  NodeKind,
  TransitionKind,
  ContextPolicy,
} = require("../dist/gen/ts/port/api/v1/agent_session.js");

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
