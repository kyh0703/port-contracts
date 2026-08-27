# Handoff System Prompt Contract

## Goal

- Publish an additive Handoff route system prompt transport without changing existing field semantics.

## References

- docs/STATE.md
- docs/ROADMAP.md
- docs/ARCHITECTURE.md
- docs/orchestration-contract-v1/designs/2026-08-27-orchestration-contract-v1-handoff-system-prompt.md

## Workspace

- Branch: feat/orchestration-contract-v1-handoff-system-prompt
- Base: main
- Isolation: required
- Created by: exec-plan via git-worktree

## Task Graph

### Task T1
- [x] Complete
- Goal: Add optional `system_prompt` to PublishedHandoffRoute and regenerate all language artifacts with validation coverage.
- Depends on:
  - none
- Write Scope:
  - proto/port/api/v1/agent_session.proto
  - gen/
  - internal/
  - package.json
  - package-lock.json
  - README.md
- Read Context:
  - docs/orchestration-contract-v1/designs/2026-08-27-orchestration-contract-v1-handoff-system-prompt.md
- Checks:
  - make generate
  - make breaking
  - npm run check
  - go test ./...
  - go vet ./...
  - npm pack --dry-run
- Parallel-safe: no

## Notes

- Preserve field numbers 1-8; allocate field 9.
- Release as additive `5.1.0` with a new exact execution publication revision.
