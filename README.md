# port-contracts

Shared protobuf contracts for the `port-*` internal APIs.

## Generate

```bash
buf dep update
buf generate
npm run build
```

Docker-only:

```bash
docker run --rm -v "$PWD:/workspace" -w /workspace bufbuild/buf:latest dep update
make docker-generate
```

## TypeScript

Published package:

```bash
pnpm add @overthinker1127/port-contracts
```

Example import:

```ts
import { ApiEventServiceClient } from '@overthinker1127/port-contracts/gen/ts/port/api/v1/gateway_events'
```

`port/api/v1/agent_session.proto` is the API's worker-only session bootstrap
and transfer control contract. `ExecutionSessionService.BootstrapPublished`
requires native attempt authorization in addition to the original
one-time browser ticket or verified SIP binding, and returns one exact Agent
supervisor or handoff runtime with its mandatory runtime lease. The publication revision is
`execution-publication-2026-09-15-r2` for keypad collection. The wire also recognizes
legacy `execution-publication-2026-09-04-r1`; services enforce the negotiated
revision so older workers cannot silently skip collection. The response carries bounded typed
system and per-call user prompt variables, and handoff routes carry typed
parameters, `none | conversation | recent` context policy, and one blocking
`request_start` message. Older Agent bootstrap services and revision fallbacks
are intentionally unavailable.

## Optional client speaking plan — 10.2.0

`SpeechPolicyRuntime.client_speaking_plan` is optional message field 4.
`ClientSpeakingPlanRuntime` carries `enabled` (bool, field 1),
`on_punctuation_seconds` (field 2), `on_no_punctuation_seconds` (field 3),
`on_number_seconds` (field 4), and `wait_seconds` (field 5). The first three
timers accept finite 0–3-second values; playback wait accepts 0–5 seconds.
Existing speech-policy fields 1–3 and absent legacy original bytes are unchanged.
Explicit zero and inactive prepared-message presence survive serialization.

New client originals choose one numeric-first, punctuation, or incomplete
minimum endpoint wait; these timers and legacy numeric extensions do not stack.
Playback wait begins after first TTS audio is ready, once per logical speech.
Soniox server mode takes precedence without deleting the prepared client plan.
Missing legacy original fields must not be filled or alter original hashes.

The local matching API/worker10.2.0 archive includes both this policy and the
Soniox addition below; Web continues its HTTP-only10.0.0 dependency. Wire51
regressions and real Go validators cover presence, zero, and finite bounds.
Main publication is approved; registry publication and deployment are separate.

## Optional Soniox endpoint policy — 10.1.0

`SttRuntime.soniox_endpointing` is optional message field 9; existing fields 1–8
are unchanged. `SonioxEndpointingRuntime` contains `server_turn_detection`
(bool, field 1), `latency_adjustment_level` (uint32 0–3, field 2),
`sensitivity` (double -1–1, field 3) and `max_delay_ms` (uint32 500–3000, field 4).
The parent validator permits the message only for an explicit Soniox provider.

Absence remains absent in legacy binary originals. An inactive prepared policy
also retains message presence; explicit false/zero values use normal protobuf
scalar encoding without dropping the parent message. Readers must not inject
new defaults into immutable originals or change their hashes.

API and worker consume the matching local 10.2.0 archive. Web's administrator
controls use HTTP JSON and do not require upgrading its 10.0.0 archive. Deploy
matching API/worker and approved runtime inventory before enabling server mode;
older workers ignore this additive field. Wire presence/regression fixtures
and the real Go validator cover the legacy, provider and numeric boundaries.
This source change is not an npm registry publication or production deployment.

## Deepgram retirement — 10.0.0

`SttRuntime.provider` retains field number 5 and optional wire presence, but
validation now requires an explicit `soniox` or `xai` identity. Deepgram,
missing and empty providers are rejected instead of choosing another provider's
credentials. STT models and credentials are never silently relabeled. TTS
providers and the remaining wire fields are unchanged.

Update API, worker and Web to the matching vendored 10.0.0 package together.
The API's existing Deepgram retirement migrations already migrate eligible
mutable profiles/defaults to language-matched Soniox and reject retired catalog
rows. Do not edit applied migrations or rewrite immutable publication,
conversation or usage history. Retired original pins require a new supported
configuration/publication; they are not runtime compatibility routes.

The real Go validator rejected missing/Deepgram providers after a failing-before
regression; Soniox and xAI remain accepted. TypeScript serialization still
preserves optional wire presence, so API and worker also enforce provider
identity at their runtime boundaries. No registry publication, production SQL
execution or operating deployment is implied by this source change.

## Background audio removal — 9.0.0

`CallRuntimeSnapshot.background_audio` is removed; field number 3 and the name
`background_audio` are reserved and must never be reused. `BackgroundAudioRuntime`
and `BackgroundAudioPreset` are removed from generated TypeScript, Go and Python.
Voice bootstrap still requires STT, TTS, VAD, DTMF, transport and speech policies,
but no longer requires or carries ambient/thinking audio. Prior field-3 binary
values are ignored without changing the remaining runtime fields.

Update API, worker and Web to the matching vendored 9.0.0 package together.
Old validators require the removed field, so this is not an additive release.
Mutable saved settings are cleaned by the API's canonical migration; immutable
publication snapshots remain unchanged and their retired background settings
are not projected into runtime payloads. No package publication or deployment
is implied by this source change.

## Personal conversation context — 8.2.0

`NodeModelSettings.history_max_bytes` (optional uint32, field 4) opts a node into
a UTF-8 serialized conversation-history view of 8192–262144 bytes. Fixed
instructions are excluded; this is neither output tokens nor exact provider
input tokens. Absence leaves existing node inference behavior unchanged.

`PublishedAgentNodeRuntime.context_tool` (message, field 19) carries the API-owned
`RuntimeContextTool` reference, fixed `read_space_context` name, description and
whole-result byte ceiling. It is not caller metadata or a tenant/source grant.
`ExecutionSessionService.ReadRuntimeContext` requires current main-owner
authorization, node ID and that pinned reference. Query is 1–4000 UTF-8 bytes;
optional `max_bytes` is 1024–16384 and `limit` is 1–20. The response `result_json`
includes cited sources and authorized memory within the entire JSON byte budget.

API and worker retain publication/node/actor authority, personal-principal
provenance and memory settings. Published Space originals remain immutable.
An ordinary Agent root explicitly authored with `memoryScope: "caller"` can
return live caller-owned Space citations (`origin.kind: "space"`) or consented
customer facts. Workers accept a Space origin only when it matches the original
server-owned `space-context:<spaceId>:<nodeId>` reference. Manual customer facts
keep `sourceConversationId: null`; no conversation provenance is invented.
No graph, role, tool authority or private helper capability is inferred from data.
Publication revisions r1/r2, HA `runtime-recovery-v1` and protobuf fields stay
unchanged. Roll out matching API/worker before exposing caller-enabled presets;
older strict workers do not implement these result semantics. No SQL migration,
registry package publication or operating deployment is implied.

## Agent-generated opening — source change

`PublishedAgentNodeRuntime.greeting` is removed; field number 17 and the name
`greeting` are reserved and must never be reused. The active agent generates its
opening from its instructions and current conversation context, without a fixed
phrase or preset fallback. Historical field-17 binary values are skipped, and
the generated JSON adapters do not expose the retired property.

The protobuf and generated TypeScript, Go, and Python sources are updated without
a package version bump. This is not a registry publication or deployment.
Consumers retaining older vendored packages must stop authoring and projecting
the optional greeting immediately; their unused optional generated type may
remain until a coordinated contracts release updates API, worker, and Web.
Do not replace same-version archives or upgrade unrelated contracts as part of
this removal. Existing stored greetings remain inert; no data migration is needed.

## Number-ending EOT wait — 8.1.0

`SpeechPolicyRuntime.eot_on_number_secs` (optional double, field 3) carries the
owner's additional numeric-ending wait in seconds, bounded to 0–3. Absence uses
0.5 seconds in the worker; explicit zero disables the extension and remains
present through binary and JSON round trips. API HTTP settings use the exact
key `eot_on_number_secs`; generated TypeScript uses `eotOnNumberSecs`.

Apply the canonical conversation-settings migration before the new API. Roll out
API and worker together before exposing the Web input: an old worker ignores the
additive field. This is an EOT hold before LLM generation, not TTS playback delay
or a global VAD-silence change. API pins the value at admission; active sessions
keep their original policy. This source change is not a production deployment.

## Runtime HA — 8.0.0

`8.0.0` is a breaking coordinated release for API, worker, Web and aggregator.
`runtime_identity.proto` owns attempt/current/helper/receipt authority and public
runtime projections; `agent_session.proto` imports it without a circular dependency.
HA protocol `runtime-recovery-v1` is independent of the retained publication revisions.

- Execution/epoch/purpose authorization is mandatory for bootstrap, form,
  transfer, provider resolution and runtime/privacy/realtime operations. A shared
  server key, room metadata or expired owner is not job authority.
- Recovery/checkpoint RPCs preserve the original publication, session, caller,
  intent, quota and absolute deadlines. A committed checkpoint is not an audio ACK.
- Main and helper execution authority stay separate. HUMAN and neutral transfer/
  text-relay recovery do not inherit a generic AI actor or helper capability.
- Original-run receipt authority can retain late usage/provider facts without
  reviving expired current control. Capture completeness remains explicit.
- Actual generated TypeScript build and 36 wire tests passed. The local consumers
  use the same `8.0.0` archive. Generation/build does not prove Cloud assignment,
  media-token revocation, active-fleet failover or production data/key availability.
- The API/worker/Web archives have the same SHA-256:
  `abdb22237727cb4da36f2e3cec49a58dafbc38d95229944e43cdce5dd1713e86`.

## Earlier releases

`7.20.0` adds `CallLimitsRuntime.no_answer_timeout_enabled` (field 4).
Only explicit `true` opts a voice session into silence termination; absent/false
does not. The positive `no_answer_timeout_seconds` value remains available while
disabled. Idle reminders are independent: their exhaustion does not end an
opted-out call. VAD, interruptions, explicit termination and hard duration/credit
limits remain separate. API snapshots the setting at admission.
The field is additive, but old workers ignore it and can still terminate an
opted-out call: migrate settings, roll out API and worker together, drain old
workers, then expose the Web toggle. This release does not imply deployment.
Wire validation passed 47 tests, including legacy positive-timeout decoding and
explicit ON/OFF serialization; the two new cases failed before generation.

`7.19.0` allows a Supervisor root with zero specialists. The required nonempty
root/node identity, at most 100 execution nodes, and the existing handoff contract
remain unchanged. API and worker accept the same canonical V4/r2 topology for
Agent or Space publications; no fake specialist or separate wire/runtime is added.
Field numbers and `execution-publication-2026-09-15-r2` are unchanged. Roll out
the API and worker together before permitting root-only publications. Protobuf
lint/generation/build, 45 wire tests, and Go validation tests passed.

`7.18.0` adds required nonempty `AgentSessionBootstrapResponse.user_id`
(field 11). The API supplies the admitted account UUID; the worker uses it for
account-erasure admission and atomic cache/usage publication fences. Identity
must not be inferred from dispatch metadata. Deploy the API and worker together
and drain old workers before permitting withdrawal approval; missing owner
identity fails closed rather than invoking a compatibility fallback.

`7.2.0` adds `ExecutionSessionService.CommandSipTransfer` and optional
`transfer_capability`, `TransferToHumanTool.mode` (`single | consultative`), and
`consultation_timeout_ms`. The API authenticates each command against the
admitted session and resolves the destination from its pinned publication.
Consultation credentials belong only to the worker; the room may use isolated
media permissions within the existing call on self-hosted LiveKit. `ready`
confirms briefing playout, and `accept` carries the exact consultant identity
and voice or DTMF consent source before the API can connect the calls. Missing policy fields retain the API's consultative defaults.
The existing publication revision and field numbers remain unchanged.

`7.16.0` adds worker-only `ExecutionSessionService.CommandFormCollection`
(`create | poll | cancel | ack`) and `HandoffParameterCollection.input = web_form`
with optional `format = digits | phone | birthdate`. Existing DTMF field numbers and
encoding are unchanged. API and worker must deploy together with this contract;
the new RPC is required for form routes. Values are returned only for completed
requests and are erased from the form store on acknowledgement. Form links are
not part of the worker response; only authenticated owners of browser-test
conversations can retrieve preview links.

Tool announcement arrays accept up to ten candidates for each of the four
stages (40 entries total). Entries with the same `type` are alternatives;
the worker selects one uniformly at random for each stage on every tool
invocation. A selected delayed message keeps its own `timingMilliseconds`.
All candidates remain in the publication and wire payload. A single candidate
keeps the previous behavior, and repeated calls may select the same candidate.
Transfer start/failure announcements share the selection with the transfer
coordinator so its fallback and the common wrapper do not speak twice.

```ts
import { ExecutionSessionServiceClient } from '@overthinker1127/port-contracts/gen/ts/port/api/v1/agent_session'
```

## Go

Example import:

```go
import apiv1 "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1"
```

Validation:

```go
import "github.com/kyh0703/port-contracts/v4/validation"

err := validation.Validate(&apiv1.RecordGatewayEventRequest{
    EventType: apiv1.GatewayLifecycleEventType_GATEWAY_LIFECYCLE_EVENT_TYPE_AGENT_STARTED,
    ConversationId: "conversation-1",
    OccurredAt: timestamppb.Now(),
})
```

The Go output also includes `grpc-gateway` reverse-proxy handlers generated
from `google.api.http` annotations.

## Release

Push a tag like `v0.1.0`. GitHub Actions runs Buf generation, builds the
TypeScript package, and publishes to npm.

GitHub Actions requires an `NPM_TOKEN` repository secret for npm publishing.
