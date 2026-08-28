---
feature: flat-built-in-tool-condition
created_at: 2026-08-28T21:07:13+09:00
---

# Flat Built-in Tool Condition Contract

## Goal

Carry the user-authored invocation condition for `end_call` and `transfer` while preserving the existing built-in Tool wire and legacy publications.

## Context / Inputs
- Source docs: `docs/STATE.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`
- Existing system facts: published runtimes carry `end_call` and `transfer_to_human` in repeated `built_in_tools`; their descriptions are currently runtime-owned constants.
- User brief: Tool persistence becomes flat, the user edits only a condition, and runtime appends locked operational wording. Base STT remains always enabled; no transfer STT option is introduced.

## Plan Handoff
### Scope for Planning
- Add an additive `condition` string to the existing end-call and transfer built-in Tool configs.
- Preserve field numbers, legacy singular/repeated fields, and all existing wire behavior.
- Treat an absent/empty condition as a legacy publication that requires runtime defaults.
- Release the contract as additive `5.4.0` for API and voice-agent consumers.

### Success Criteria
- TypeScript and Go generated contracts expose the new condition fields.
- A legacy payload without condition round-trips unchanged.
- A new payload with condition round-trips the exact UTF-8 value.
- Wire tests, package checks, and Buf breaking checks pass.

### Non-Goals
- Adding `sttEnabled` or changing STT billing.
- Replacing `built_in_tools` with a new generic Tool wire in this release.
- Changing callable names `end_call` and `transfer_to_human`.

### Open Questions
- None.

### Suggested Validation
- RED/GREEN TypeScript and Go wire tests for absent and populated condition fields.
- `npm test`, `npm run check`, `go test ./...`, and `buf breaking`.

### Parallelization Hints
- Candidate write boundaries: proto/generated artifacts and wire tests.
- Shared files to avoid touching in parallel: package versions and generated indexes.
- Likely sequential dependencies: proto first, generation/version bump second, verification last.
