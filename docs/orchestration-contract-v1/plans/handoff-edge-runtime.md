# Handoff Edge Runtime Contract

## Goal

- Release-ready contract changes for typed handoff edge parameters, recent
  context, request-start, and the new execution-publication revision.

## References

- `docs/STATE.md`
- `docs/ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/contracts/agent-orchestration-v1.md`
- `docs/contracts/agent-orchestration-v1-transport.md`
- `docs/orchestration-contract-v1/designs/2026-08-26-orchestration-contract-v1-handoff-edge-runtime.md`

## Workspace

- Branch: feat/orchestration-contract-v1-handoff-edge-runtime
- Base: main
- Isolation: required
- Created by: exec-plan via git-worktree

## Task Graph

### Task T1
- [x] Complete
- Goal: Add and generate the new handoff edge publication contract with wire and package verification.
- Depends on:
  - none
- Write Scope:
  - `README.md`
  - `proto/port/api/v1/agent_session.proto`
  - `tests/agent-session-wire.test.cjs`
  - `tests/release-v2.test.cjs`
  - `validation/**`
  - `package.json`
  - `package-lock.json`
  - `gen/**`
  - `dist/**`
- Read Context:
  - `docs/orchestration-contract-v1/designs/2026-08-26-orchestration-contract-v1-handoff-edge-runtime.md`
  - `docs/contracts/agent-orchestration-v1-transport.md`
- Checks:
  - `node --test tests/agent-session-wire.test.cjs`
  - `go test ./...`
  - `npm run check`
  - `git diff --check`
- Parallel-safe: no

## Notes

- TDD evidence must record the failing wire test before protobuf changes.
- Do not publish the package to npm in this plan.
