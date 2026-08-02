const assert = require("node:assert/strict");
const test = require("node:test");

const {
  BootstrapResponse,
} = require("../dist/gen/ts/port/api/v1/agent_session.js");

test("supervisor/worker bootstrap fields survive protobuf wire round-trip", () => {
  const source = BootstrapResponse.create({
    conversationId: "conversation-1",
    sessionId: "session-1",
    source: "webrtc",
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
