---
feature: handoff-system-prompt
created_at: 2026-08-27T13:20:00+09:00
---

# Handoff System Prompt Contract

## Goal

Published Handoff Route에 전환 직후 첫 응답용 optional 시스템 프롬프트를 additive transport field로 제공한다.

## Context / Inputs

- Source docs: `docs/STATE.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`
- Existing system facts: `PublishedHandoffRoute`는 condition, context policy, parameters, request_start를 전달한다.
- User brief: Admin에서 Handoff 시스템 프롬프트를 설정하고 LiveKit target 첫 응답에 적용한다.

## Plan Handoff

### Scope for Planning

- `PublishedHandoffRoute`에 optional `system_prompt` string field를 additive로 추가한다.
- 빈 문자열은 미설정으로 해석하고 기존 route wire 호환성을 유지한다.
- generated Go/TypeScript/Python 산출물과 contract package minor version/revision을 갱신한다.

### Success Criteria

- 새 field가 모든 생성물에 존재한다.
- 기존 field number와 deprecated announcement 호환성이 유지된다.
- transport 검증과 breaking check가 통과한다.

### Non-Goals

- LiveKit SDK 타입 노출
- prompt 템플릿 치환
- Supervisor transport 변경

### Open Questions

- 없음.

### Suggested Validation

- protobuf 생성, Go/TS/Python 테스트, buf breaking, npm pack 검증

### Parallelization Hints

- Candidate write boundaries: protobuf 원본과 생성물은 한 작업자가 소유한다.
- Shared files to avoid touching in parallel: package/lock 및 generated tree
- Likely sequential dependencies: proto 변경 후 생성·검증
