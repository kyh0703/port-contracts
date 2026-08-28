# Flat Built-in Tool Condition Contract

## Goal
- Add an optional condition to built-in Tool runtime configs without breaking legacy publications.

## References
- docs/STATE.md
- docs/ROADMAP.md
- docs/ARCHITECTURE.md
- docs/orchestration-contract-v1/designs/2026-08-28-orchestration-contract-v1-flat-built-in-tool-condition.md

## Workspace
- Branch: feat/orchestration-contract-v1-flat-built-in-tool-condition
- Base: main
- Isolation: required
- Created by: exec-plan via git-worktree

## Task Graph
### Task T1
- [x] Complete
- Goal: Add, generate, version, and verify the additive built-in Tool condition contract.
- Depends on:
  - none
- Write Scope:
  - proto/port/api/v1/agent_session.proto
  - gen/**
  - tests/**
  - package.json
  - package-lock.json
  - CHANGELOG.md
- Read Context:
  - docs/orchestration-contract-v1/designs/2026-08-28-orchestration-contract-v1-flat-built-in-tool-condition.md
- Checks:
  - npm test
  - npm run check
  - go test ./...
  - buf breaking --against '.git#branch=main'
- Parallel-safe: no

## Notes
- Missing condition is a valid legacy payload and must remain distinguishable as the empty string.
