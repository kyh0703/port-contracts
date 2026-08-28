---
feature: knowledge-query-tool-runtime
created_at: 2026-08-28T16:23:07+09:00
---

# Knowledge Query Tool Runtime

## Goal

Represent Knowledge retrieval as ordinary repeated Tool metadata/runtime while preserving the existing singular knowledge fields only for legacy publications.

## Context / Inputs
- Source docs: `docs/STATE.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`
- Existing system facts: contracts 5.2 carries one singular knowledge revision, function name, description, and capability per Agent runtime.
- User brief: Knowledge is a base resource; a Knowledge Query Tool owns the callable function name, and Tool Registry names may repeat.

## Plan Handoff
### Scope for Planning
- Add `knowledge` to `NodeToolMetadata.kind` and its metadata oneof.
- Add a repeated `KnowledgeToolRuntime` keyed by `tool_id` to direct and inline runtimes.
- Preserve all existing field numbers and singular knowledge fields for legacy decode.
- Generate all language outputs, add wire fixtures, and release npm 5.3.0.

### Success Criteria
- Multiple Knowledge Query Tools round-trip with stable tool IDs, revision IDs, and capabilities.
- Existing 5.2 payloads still decode unchanged.
- Contract revision remains unchanged and breaking checks pass.

### Non-Goals
- Registry persistence.
- Deduplication policy.
- RAG search API changes.

### Open Questions
- None.

### Suggested Validation
- RED/GREEN TypeScript wire tests for repeated Knowledge Tool metadata/runtime.
- `npm run check`, `go test ./...`, `buf breaking --against '.git#branch=main'`.

### Parallelization Hints
- Candidate write boundaries: protobuf and generated outputs are one sequential boundary.
- Shared files to avoid touching in parallel: package metadata and generated indexes.
- Likely sequential dependencies: schema edit, generation, then release.
