# Knowledge Function Runtime Contract

## Goal
- Publish an additive contracts package that carries knowledge function metadata to runtime consumers.

## References
- docs/STATE.md
- docs/ROADMAP.md
- docs/ARCHITECTURE.md
- docs/orchestration-contract-v1/designs/2026-08-28-orchestration-contract-v1-knowledge-function-runtime-contract.md

## Workspace
- Branch: feat/orchestration-contract-v1-knowledge-function-runtime-contract
- Base: main
- Isolation: required
- Created by: exec-plan via git-worktree

## Task Graph
### Task T1
- [x] Complete
- Goal: Add, generate, and verify additive knowledge function metadata fields.
- Depends on:
  - none
- Write Scope:
  - proto/port/api/v1/agent_session.proto
  - gen/**
  - tests/**
  - package.json
  - package-lock.json
- Read Context:
  - docs/orchestration-contract-v1/designs/2026-08-28-orchestration-contract-v1-knowledge-function-runtime-contract.md
- Checks:
  - npm run check
- Parallel-safe: no

## Notes
- Keep the existing publication contract revision unchanged.
