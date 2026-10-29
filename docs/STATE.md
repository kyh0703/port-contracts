# State

current_version: contracts-8.2.0
last_updated: 2026-10-21

## Parallel validation tests

- Independent Go contract validation tests use `t.Parallel()`; shared subtests
  retain their order. `go test -race -count=1 ./...` passed.
- Node 24 wire tests passed through `npm run test:wire`; publication and
  deployment were not performed.

## Agent-generated opening — source only

- Removed `PublishedAgentNodeRuntime.greeting` and reserved field 17 and its name.
- Regenerated TypeScript, Go, and Python bindings with `npm run generate`.
  The wire regression now covers ignoring historical binary/JSON greeting values.
- The opening-only change did not bump the package or replace existing archives.
  The coordinated8.2.0 context release below includes that retirement; API and
  worker adopt its newly built archive together, rather than changing an8.1.0 archive.
- Existing persisted greetings remain inert. Opening content is generated from
  instructions and conversation context, never from a fixed default phrase.
- Verification of the opening-only change: protobuf lint, TypeScript build,
  all42 wire tests and `go test ./...` passed. Registry publication and deployment
  remained separate.

## Personal conversation context — 8.2.0, source only

- Added optional node `context_tool` field 19, optional model
  `history_max_bytes` field 4, and owner-authorized `ReadRuntimeContext`.
  UTF-8 JSON budgets, current-publication/node references and optional feature
  presence are explicit. Existing execution modes and publication revisions remain.
- Regenerated canonical TypeScript/Go/Python bindings. Buf lint and breaking
  compatibility passed; TypeScript build and 42 existing wire cases passed.
  Go tests/vet and Python generated-source syntax compilation passed.
  A temporary 8.1-failing/8.2-passing program exercised the actual new wire fields.
- API and worker consume the identical local8.2.0 archive, SHA-256
  `cf6b322e5e0c653bf30d83757298f98207e3304f458f6d89f707821d392a5813`.
  The API's exact Docker deps stage completed its frozen Node24/pnpm10.26.0 install.
- No package registry publication, production change, schema migration or main
  integration occurred. Matching API/worker must precede new personal presets.

## Number-ending EOT wait — 8.1.0, source only

- Added optional double `SpeechPolicyRuntime.eot_on_number_secs`, field 3,
  constrained to 0–3 seconds. TypeScript uses `eotOnNumberSecs`; omission is
  distinct from explicit zero so the worker can apply default 0.5 or disable.
- Regenerated TypeScript, Go and Python bindings. The binary/JSON presence
  regression failed four configured-value cases before generation; all 42 wire
  tests and Go validation passed, including finite bounds and missing/zero.
- API and worker consume the same local 8.1.0 tarball with SHA-256
  `0dad6ba795c975f7d51e01e247f8298e4786fcaa4f2d6b14e33593b0bda8c54d`.
  Main publication is source-only; registry publication and production rollout remain separate.

## MCP timeout extension — 7.17.0

- `McpServerRuntime.timeout_ms` is optional uint32 field 5, constrained to
  1000..600000 when present. Existing headers remain field 4.
- Regenerated TypeScript, Go and Python bindings. API and voice runtime use
  the locally vendored 7.17.0 package; no registry publication performed.
- Two wire tests passed: boundary values and headers survive binary/JSON
  roundtrips; omitted timeout remains absent and explicit zero retains presence
  for validation. A real MCP SDK network smoke consumed this package through
  runtime materialization and preserved configured headers and call deadlines.

## Active

The canonical worker boundary is `proto/port/api/v1/agent_session.proto` plus
`runtime_identity.proto`. `ExecutionSessionService.BootstrapPublished` returns
one pinned Supervisor/Handoff graph, typed prompt variables, transport runtime
and mandatory owner lease. Publication revision
`execution-publication-2026-09-15-r2` is current; the explicitly admitted legacy
revision is `execution-publication-2026-09-04-r1`. HA protocol
`runtime-recovery-v1` is independent of publication and npm versions.

Contracts8.2.0 adds typed personal-context lookup and an optional history-view
budget without a new execution mode. The HTTP personal principal and scoped
immutable sources remain API-owned; a retrieved payload grants no role or effect.

`Bootstrap`, `BootstrapAgent`, `BootstrapOrchestration` and the old
`orchestration-2026-08-07-r4` runtime are retired, with no fallback aliases.
The earlier `docs/contracts/agent-orchestration-v1*.md` and
`docs/orchestration-contract-v1/` records describe historical orchestration,
not the current worker integration.

