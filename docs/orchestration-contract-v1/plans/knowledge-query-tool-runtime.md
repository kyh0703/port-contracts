# Knowledge Query Tool Runtime

## Goal
- Release additive contracts 5.3.0 for repeated Knowledge Query Tools.

## References
- docs/STATE.md
- docs/ROADMAP.md
- docs/ARCHITECTURE.md
- docs/orchestration-contract-v1/designs/2026-08-28-orchestration-contract-v1-knowledge-query-tool-runtime.md

## Workspace
- Branch: feat/orchestration-contract-v1-knowledge-query-tool-runtime
- Base: main
- Isolation: required
- Created by: exec-plan via git-worktree

## Task Graph
### Task T1
- [x] Complete
- Goal: Add repeated Knowledge Tool wire fields, regenerate outputs, and prepare contracts 5.3.0.
- Depends on:
  - none
- Write Scope:
  - proto/port/api/v1/agent_session.proto
  - gen/**
  - tests/**
  - package.json
  - package-lock.json
- Read Context:
  - docs/orchestration-contract-v1/designs/2026-08-28-orchestration-contract-v1-knowledge-query-tool-runtime.md
- Checks:
  - npm run check
  - go test ./...
  - buf breaking --against '.git#branch=main'
- Parallel-safe: no

## Notes
- Keep singular knowledge fields as legacy compatibility fields.
