---
feature: knowledge-function-runtime-contract
created_at: 2026-08-28T14:36:00+09:00
---

# Knowledge Function Runtime Contract

## Goal

Add the LLM-facing knowledge function name and description to each published prompt runtime without changing the publication contract revision.

## Context / Inputs
- Source docs: `docs/STATE.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`
- Existing system facts: prompt and inline runtimes already carry a knowledge revision ID and retrieval capability.
- User brief: use a configurable `function_name` and description for RAG tools instead of the fixed `knowledge_search` metadata.

## Plan Handoff
### Scope for Planning
- Add additive string fields to both published prompt runtime messages.
- Regenerate TypeScript, Go, and Python outputs and update wire fixtures.
- Release the additive package version consumed by API and voice-agent.

### Success Criteria
- Both runtime variants preserve `knowledge_function_name` and `knowledge_description` over protobuf encode/decode.
- Existing field numbers and `contract_revision` remain unchanged.
- Contract checks pass.

### Non-Goals
- Persisting Agent settings.
- Rendering Web controls.
- Materializing the LiveKit tool.

### Open Questions
- None.

### Suggested Validation
- `npm run check`

### Parallelization Hints
- Candidate write boundaries: protobuf and generated outputs are one sequential boundary.
- Shared files to avoid touching in parallel: `package.json`, generated indexes.
- Likely sequential dependencies: generation follows protobuf edits.
