---
feature: handoff-edge-runtime
created_at: 2026-08-26T21:09:37+09:00
---

# Handoff Edge Runtime Contract

## Goal

Publish a LiveKit-neutral handoff edge contract that carries typed LLM arguments,
bounded recent context, and one blocking request-start message into the execution
publication consumed by the voice-agent.

## Context / Inputs

- Source docs:
  - `docs/STATE.md`
  - `docs/ROADMAP.md`
  - `docs/ARCHITECTURE.md`
  - `docs/contracts/agent-orchestration-v1.md`
  - `docs/contracts/agent-orchestration-v1-transport.md`
- Existing system facts:
  - `PublishedHandoffRoute` currently carries source/target, routing description,
    `none | conversation` context, and one announcement string.
  - Orchestration keeps `supervisor | handoff` as exclusive modes.
  - Start and End are Web projections and are not runtime node kinds.
- User brief:
  - Keep Agent Node and Handoff Edge storage independent of LiveKit SDK types.
  - Compile typed edge parameters to a function tool and store values in
    session-scoped runtime state.
  - Support `none | recent`, blocking request-start, and interruption cancellation.

## Plan Handoff

### Scope for Planning

- Introduce a new execution-publication contract revision.
- Add a primitive handoff parameter message with `string | number | boolean`,
  required, description, and type-matched enum values.
- Extend the existing context policy enum with `recent`; Handoff routes use the
  existing field number while Supervisor relations retain `conversation | none`.
  The producer materializes omitted Handoff draft values to `recent` and the
  runtime uses a fixed recent window of six chat items.
- Keep field-number-six announcement as a deprecated compatibility input and
  add canonical request-start on a new field. Reject simultaneous population;
  new producers emit only request-start and new consumers prefer it before the
  compatibility value.
- Keep request-complete, request-failed, request-response-delayed, summary,
  rejection plans, End nodes, supervisor relations, and LiveKit SDK types out of
  this contract slice.
- Regenerate Go, TypeScript, and Python outputs and bump the package major version.

### Success Criteria

- Handoff parameters round-trip with required flags and type-matched enum values.
- A handoff route round-trips `none | recent` and request-start.
- Supervisor payloads and existing node runtime fields remain unchanged.
- The new revision is required by request and response validation.
- Generated outputs, wire tests, proto lint, TypeScript build, and package metadata pass.

### Non-Goals

- Runtime VariableBag implementation or LiveKit tool compilation.
- API draft persistence and Web editor changes.
- Supervisor/delegate parameter support or mixed orchestration modes.
- Package publication to npm.

### Open Questions

- None. The accepted defaults are recent context with six items and a
  trusted/inferred runtime VariableBag split.

### Suggested Validation

- Add failing wire tests for typed parameters, recent context, request-start,
  and the new revision before editing protobuf.
- Run `npm run check`, `go test ./...`, and `git diff --check` after generation.

### Parallelization Hints

- Candidate write boundaries:
  - Protobuf, generated files, wire tests, and package metadata form one
    sequential generated-contract task.
- Shared files to avoid touching in parallel:
  - `proto/port/api/v1/agent_session.proto`
  - `package.json`
  - `package-lock.json`
  - generated output directories
- Likely sequential dependencies:
  - RED wire test, proto change, generation, package metadata, full check.
