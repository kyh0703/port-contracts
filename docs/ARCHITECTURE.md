# Architecture

## Purpose

이 저장소는 port 서비스 사이의 protobuf 원본과 생성물을 소유한다.
Agent·Orchestration의 현재 기준은 [공통 계약](contracts/agent-orchestration-v1.md)과
[transport 상세 계약](contracts/agent-orchestration-v1-transport.md)이다.

## Agent·Orchestration Transport Boundary

```text
legacy agent.canvas.v1 ──> Bootstrap ──> legacy compiler

AgentVersion ──────────> BootstrapAgent ───────────> direct compiler
OrchestrationVersion ─> BootstrapOrchestration ──> orchestration compiler
Conversation ─────────> CallRuntimeSnapshot + AgentRuntime inputs
```

두 경계는 별도 RPC와 response를 사용한다. 신규 Orchestration은
`contractRevision = "orchestration-2026-08-07-r4"`를 필수로 하며 잘못된 신규
payload를 legacy decoder로 fallback하지 않는다.

두 신규 response는 API가 통화 시작 시 CallRuntimeConfig에서 고정한
CallRuntimeSnapshot 하나로 Transport, VAD, STT, Voice를 포함한 TTS와 통화
policy, BackgroundAudio와 DTMF 입력 설정을 전달한다. 각 AgentRuntime 입력은
LLMWorker, Instructions, Context 초기화 policy, Tools, MCP와 API tool 단기
credential을 포함하며 CallRuntime 필드를 중복하지 않는다.
Orchestration mode payload는 `supervisor | handoff` 중 정확히 하나다.

```text
CallRuntimeSnapshot — response당 하나
├─ Transport
├─ VAD
├─ STT
│  └─ Keyterms
├─ TTS
│  └─ Voice
├─ BackgroundAudio
├─ DTMF input
└─ Policies
   ├─ Interruption
   └─ Limits / Timeouts

AgentRuntime — AgentVersion별 입력
├─ LLMWorker
├─ Instructions
├─ Context
├─ Tools metadata
├─ API tool runtime credentials
└─ MCP runtime bindings
```

## Retired Boundary

`contracts@1.8.0`의 `BootstrapResponse.orchestration_graph`는 역사적 retired
계약이다. 기존 field와 message는 legacy 통화를 위해 보존하지만 신규
Orchestration projection에 사용하지 않는다. 신규 경계는 `contracts@2.0.0`으로
출시됐고, 실행 입력을 완결하는 `2.1.0` 후보는 기존 r4 wire에 field만 additive로
추가한다.
