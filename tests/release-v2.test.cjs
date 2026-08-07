const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("npm release metadata is pinned to 2.0.0", () => {
  const packageJson = JSON.parse(read("package.json"));
  const packageLock = JSON.parse(read("package-lock.json"));

  assert.equal(packageJson.version, "2.0.0");
  assert.equal(packageLock.version, "2.0.0");
  assert.equal(packageLock.packages[""].version, "2.0.0");
});

test("Go module uses the v2 import boundary", () => {
  const moduleDeclaration = read("go.mod").split("\n", 1)[0];
  assert.equal(moduleDeclaration, "module github.com/kyh0703/port-contracts/v2");
});

test("protobuf Go packages use the v2 module path", () => {
  const expectedPackages = new Map([
    ["proto/port/api/v1/agent_session.proto", "github.com/kyh0703/port-contracts/v2/gen/go/port/api/v1;apiv1"],
    ["proto/port/api/v1/gateway_events.proto", "github.com/kyh0703/port-contracts/v2/gen/go/port/api/v1;apiv1"],
    ["proto/port/api/v1/voice_runtime.proto", "github.com/kyh0703/port-contracts/v2/gen/go/port/api/v1;apiv1"],
    ["proto/port/reg/v1/reg.proto", "github.com/kyh0703/port-contracts/v2/gen/go/port/reg/v1;regv1"],
  ]);

  for (const [protoPath, expectedPackage] of expectedPackages) {
    const match = read(protoPath).match(/^option go_package = "([^"]+)";$/m);
    assert.equal(match?.[1], expectedPackage, protoPath);
  }
});

test("r4 revision and CallRuntimeSnapshot field identifiers stay unchanged", () => {
  const agentSession = read("proto/port/api/v1/agent_session.proto");
  const r4RevisionMatches = agentSession.match(
    /string contract_revision = (?:1|5) \[[\s\S]*?\(buf\.validate\.field\)\.string\.const = "orchestration-2026-08-07-r4"[\s\S]*?\];/g,
  );
  assert.equal(r4RevisionMatches?.length, 4);

  const snapshotBody = agentSession.match(/message CallRuntimeSnapshot \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(snapshotBody, "CallRuntimeSnapshot message is missing");

  const fields = [...snapshotBody.matchAll(/^  (\w+) (\w+) = (\d+) /gm)].map((match) => ({
    type: match[1],
    name: match[2],
    number: Number(match[3]),
  }));
  assert.deepEqual(fields, [
    { type: "SttRuntime", name: "stt", number: 1 },
    { type: "TtsRuntime", name: "tts", number: 2 },
    { type: "BackgroundAudioRuntime", name: "background_audio", number: 3 },
    { type: "DtmfInputRuntime", name: "dtmf", number: 4 },
    { type: "TransportRuntime", name: "transport", number: 5 },
    { type: "VadRuntime", name: "vad", number: 6 },
    { type: "SpeechPolicyRuntime", name: "speech_policy", number: 7 },
    { type: "CallLimitsRuntime", name: "limits", number: 8 },
  ]);
});
