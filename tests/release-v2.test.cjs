const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("npm release metadata is pinned to 7.4.0", () => {
  const packageJson = JSON.parse(read("package.json"));
  const packageLock = JSON.parse(read("package-lock.json"));

  assert.equal(packageJson.version, "7.4.0");
  assert.equal(packageLock.version, "7.4.0");
  assert.equal(packageLock.packages[""].version, "7.4.0");
});

test("legacy Node module resolution maps generated TypeScript subpaths", () => {
  const packageJson = JSON.parse(read("package.json"));

  assert.deepEqual(packageJson.typesVersions, {
    "*": {
      "gen/ts/*": ["dist/gen/ts/*"],
    },
  });
});

test("Go module uses the v4 import boundary", () => {
  const moduleDeclaration = read("go.mod").split("\n", 1)[0];
  assert.equal(moduleDeclaration, "module github.com/kyh0703/port-contracts/v4");
});

test("protobuf Go packages use the v4 module path", () => {
  const expectedPackages = new Map([
    ["proto/port/api/v1/agent_session.proto", "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1;apiv1"],
    ["proto/port/api/v1/gateway_events.proto", "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1;apiv1"],
    ["proto/port/api/v1/voice_runtime.proto", "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1;apiv1"],
    ["proto/port/reg/v1/reg.proto", "github.com/kyh0703/port-contracts/v4/gen/go/port/reg/v1;regv1"],
  ]);

  for (const [protoPath, expectedPackage] of expectedPackages) {
    const match = read(protoPath).match(/^option go_package = "([^"]+)";$/m);
    assert.equal(match?.[1], expectedPackage, protoPath);
  }
});

test("publication revision includes the session prompt variable bag", () => {
  const agentSession = read("proto/port/api/v1/agent_session.proto");
  const readme = read("README.md");
  assert.match(readme, /execution-publication-2026-09-04-r1/);
  assert.doesNotMatch(readme, /execution-publication-2026-08-26-r1/);
  const publicationRevisionMatches = agentSession.match(
    /\(buf\.validate\.field\)\.string\.const = "execution-publication-2026-09-04-r1"/g,
  );
  assert.equal(publicationRevisionMatches?.length, 2);
  assert.match(agentSession, /SessionPromptVariableBag prompt_variables = 6/);
  assert.doesNotMatch(agentSession, /execution-publication-2026-08-27-r1|agent_version_id/);

  const snapshotBody = agentSession.match(/message CallRuntimeSnapshot \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(snapshotBody, "CallRuntimeSnapshot message is missing");

  const fields = [...snapshotBody.matchAll(/^  (\w+) (\w+) = (\d+)(?: |;)/gm)].map((match) => ({
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
    { type: "ConversationFillerRuntime", name: "conversation_filler", number: 9 },
    { type: "ConversationControlRuntime", name: "conversation_control", number: 10 },
  ]);
});

test("handoff route wire shape keeps compatibility field-6 announcement and canonical field-8 request_start", () => {
  const agentSession = read("proto/port/api/v1/agent_session.proto");
  const routeBody = agentSession.match(/message PublishedHandoffRoute \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(routeBody, "PublishedHandoffRoute message is missing");
  assert.match(routeBody, /ContextPolicy context_policy = 5/);
  assert.match(routeBody, /string announcement = 6 \[deprecated = true\]/);
  assert.match(routeBody, /repeated HandoffParameter parameters = 7/);
  assert.match(routeBody, /string request_start = 8/);
  assert.match(routeBody, /optional string system_prompt = 9/);
  assert.doesNotMatch(routeBody, /\bcontext_mode\b|HandoffContextMode/);
  assert.match(agentSession, /CONTEXT_POLICY_RECENT = 3;/);
});
