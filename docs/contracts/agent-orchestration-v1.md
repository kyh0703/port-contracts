---
contract: agent-orchestration-v1
contract_revision: orchestration-2026-08-07-r4
status: locked
effective_date: 2026-08-07
---

# Agent·Orchestration 공통 계약 v1

이 문서는 `web`, `api`, `voice-agent`, `contracts`가 공유하는 제품·저장·실행
계약의 단일 기준이다. 네 저장소의 이 파일은 byte 단위로 동일해야 한다.

> **Supersedes — 2026-08-07:** 이 계약은 기존 graph 중심
> `agent.orchestration.v1` 의미와 2026-08-06 이전 orchestration 설계·계획을
> 대체한다. 기존 계약은 신규 Orchestration의 호환 경로가 아니다.

`MUST`, `MUST NOT`, `SHOULD`는 각각 필수, 금지, 권고를 뜻한다.

## 1. 계약 식별과 적용 범위

- **C01 — Revision:** 신규 Orchestration payload는 제품·schema 이름
  `agent.orchestration.v1`과 필수 `contractRevision =
  "orchestration-2026-08-07-r4"`를 함께 가져야 한다. revision이 누락되거나 값이
  다르면 API와 runtime은 payload를 거부해야 한다.
- **C02 — Breaking boundary:** `contracts@1.8.0`의 기존 graph 계약은 역사적
  retired 계약이다. 새 계약은 additive 호환으로 가장하지 않고 breaking
  release로 발행해야 한다.
- **C03 — No legacy fallback:** 잘못되었거나 지원하지 않는 신규 payload를
  `agent.canvas.v1` 또는 기존 graph 실행으로 fallback해서는 안 된다.

## 2. 도메인 소유권

- **C04 — Authoring source:** Agent는 노드별 Prompt, LLM, Tools, MCP,
  Knowledge와 mode별 topology를 가진 저작 source다. Personal Space는 기존 암호화
  content와 독립 source ID를 유지한다. 실행 역할은 topology의 노드 배치가 결정한다.
- **C05 — Immutable publication:** 게시본은 노드 모델·옵션·도구·MCP와 지침을
  고정한다. root `speechSettings`에는 source 음성 revision·behavior와 실제
  STT/TTS tuple·provider voice ID를 고정한다. 노드 LLM의 전역 fallback은 없다.
- **C06 — Runtime construction:** 저작 source가 음성 설정을 저장하는 것과
  AgentRuntime이 오디오 자원을 소유하는 것은 별개다. AgentRuntime은 노드별 LLM과
  도구를 materialize하며 통화의 STT/TTS·VAD·transport를 재구성하지 않는다.
- **C07 — Persisted speech ownership:** `agent_speech_settings`,
  `space_speech_settings`가 source별 음성 설정을 소유한다. Agent 노드 모델은
  `agent_node_llm_settings`에서 읽고 mutable draft JSON에 중복 저장하지 않는다.
  `voice_runtime_defaults`는 신규 설정 초기화에만 사용한다. 별도 계정 음성 프로필과
  채널 profile FK는 두지 않으며 기존 credential 관리 경계는 유지한다.

런타임 모델은 다음 두 경계로 고정한다.

```text
CallRuntime — Conversation당 runtime instance 하나
├─ Transport
├─ VAD
├─ STT
├─ TTS
│  └─ Voice
├─ DTMF input
└─ Policies
   ├─ Interruption
   └─ Limits / Timeouts

AgentRuntime — 활성 Agent 또는 AgentTask별
├─ LLMWorker
├─ Instructions
├─ Context
├─ Tools
└─ MCP
```

통화 시작 시 게시된 `speechSettings`와 계정의 기존 종료·시간 정책을 합성해
불변 `CallRuntimeSnapshot`으로 고정하고 session-scoped CallRuntime 하나로
materialize한다. 실행 중인 모든 AgentRuntime은 같은 CallRuntime을 공유한다.
노드의 고정 모델은 LLMWorker, 지침은 Instructions, 도구·MCP binding은 각 입력이 된다.
Context는 게시본의 소유 자산이 아니라 AgentRuntime의 실행 상태다.

CallRuntimeConfig와 CallRuntimeSnapshot은 다음 값을 명시적으로 포함한다.

- `dtmf.timeoutSeconds`: 마지막 DTMF 키 입력 뒤 추가 입력을 기다리는 `1..10`
  범위의 초 단위 정수, 기본값 `3`
- `dtmf.endKey`: `null | 0..9 | # | *`, 기본값 `null`

배경음과 대기 중 키보드 소리 합성은 제거되었다. 기존 불변 snapshot의 관련 값은
실행하지 않는다. DTMF timeout은 키 입력마다 다시 시작하며, 설정된 end key는
결과에 포함하지 않고 입력 수집을 즉시 완료한다.
end key는 통화를 종료하지 않는다. DTMF를 지원하지 않는 transport에서는 이
정책을 실행하지 않되 snapshot 자체를 변경하지 않는다.

## 3. 실행 대상과 Orchestration 모드

- **C08 — Exclusive mode:** Orchestration은 `supervisor | handoff` 중 정확히
  하나의 모드를 가진다. v1에서는 모드 혼합과 중첩 위임을 금지한다.
  단일 Agent 실행을 위한 `single` Orchestration mode는 없다.
- **C09 — Execution target:** 통화 관리의 ExecutionTarget은 `agent |
  orchestration` 중 정확히 하나다. `agent`는 단일 Agent를 직접 실행하고,
  `orchestration`은 production OrchestrationVersion의 mode를 실행한다.
- **C10 — Supervisor:** `supervisor`는 Supervisor 배치 하나를 중심으로 전문
  Agent 배치가 연결되는 star 구조다. Supervisor만 전문 Agent를 호출할 수
  있다. 호출마다 전문 AgentVersion으로 새 `AgentTask`를 실행하고 완료 후
  Supervisor로 자동 복귀한다. 전문 Agent는 다른 AgentTask를 호출하거나
  handoff할 수 없다.
- **C11 — Handoff:** `handoff`는 Orchestration이 허용한 Agent 간 경로에서 대상
  Agent를 `voice.Agent`로 실행하고 세션 제어권을 완전히 이전한다. 성공한
  handoff 뒤 source Agent로 자동 복귀하지 않는다.

## 4. Publish, routing, pinning

- **C12 — Immutable topology:** 실행 게시본은 mode, node와 관계·도구 pin 및
  source 음성 선택을 고정한다. 실제 CallRuntime instance는 통화마다 생성한다.
- **C13 — Publish isolation:** 저작 node나 source 음성 설정을 바꿔도 이미
  production인 게시본은 바뀌지 않는다. 음성 저장도 초안 편집이며 새 게시가 필요하다.
  관리자 기본값 편집은 기존 source 설정·게시본에 소급되지 않는다.
- **C14 — Call routing:** 전화번호·Web endpoint는 Agent source를 가리킨다.
  개인 Space는 자체 source publication을 사용한다. 세션 admission은 해석한 정확한
  `publishedId`를 고정하고 채널에서 별도의 profile을 선택하지 않는다.
- **C15 — Conversation pin:** 같은 transaction 경계에서 게시된 음성 원본과
  계정 통화 운영 정책을 CallRuntimeSnapshot으로 고정한다. source에 게시된 음성이
  없으면 새 음성 admission을 거부하되 텍스트/과거 기록 조회는 유지한다. 이후
  publish나 설정 변경은 진행 중 통화에 소급되지 않는다.

## 5. Runtime 불변식

- **C16 — One CallRuntime:** Transport, VAD, STT, TTS와 그 Voice, 인터럽션,
  DTMF 입력 수집, 통화 한도·타임아웃은 pinned
  CallRuntimeSnapshot으로 통화 시작 시 한 번 생성한다. Agent 전환이나
  AgentTask 실행 중 player, listener 또는 policy를 교체하지 않는다. Voice를
  TTS와 분리된 Agent별 runtime으로 만들지 않는다.
- **C17 — Opening:** 최초 활성 Agent는 자신의 역할·지침·대화 맥락에서 첫 발화를
  생성한다. 고정 Greeting 필드나 기본 인사 문구는 사용하지 않는다. Supervisor가
  호출한 전문 Agent와 handoff 대상은 기존 대화를 이어가며 별도의 고정 인사를
  자동 재생하지 않는다. 시작 중복 방지 lifecycle은 유지한다.
- **C18 — Context:** 전환 context 기본값은 `conversation`이다. conversation
  복사 시 대화 내용은 전달하지만 source instructions는 전달하지 않는다.
  명시적 `none`은 새 context를 뜻한다.
- **C19 — AgentTask failure:** 전문 AgentTask 실패 시 Supervisor를 활성
  상태로 유지하고 내부 오류를 노출하지 않는 안전한 실패 결과를 반환한다.
- **C20 — Handoff failure:** handoff 실패 또는 최대 depth 초과 시 source
  Agent를 활성 상태로 유지하고 안전한 실패 결과를 반환한다.
- **C21 — Handoff depth:** OrchestrationVersion은 양의 `maxHandoffDepth`를
  snapshot한다. 성공한 Agent→Agent handoff만 depth를 1 증가시킨다. 최초
  활성화와 AgentTask 호출은 depth를 소비하지 않는다.
- **C22 — Events:** runtime은 AgentTask와 handoff의 시작·완료·거부·실패를
  ExecutionTarget version, Conversation, source/target AgentVersion, task run
  또는 transition 식별자와 함께 기록한다. 대화 원문, Prompt, credential, Task 결과
  전문과 raw DTMF 입력은 일반 로그, event 또는 metric label에 기록하지 않는다.

## 6. Transport와 출시 경계

- **C23 — New bootstrap:** Agent ExecutionTarget은 별도 `BootstrapAgent`,
  Orchestration ExecutionTarget은 별도 `BootstrapOrchestration` RPC와 response를
  사용한다. 두 response는 Conversation에 고정된 CallRuntimeSnapshot과
  AgentRuntime 입력을 전달하고,
  Orchestration response만 OrchestrationVersion과 모드별 snapshot을 가진다.
  기존 `BootstrapResponse.orchestration_graph`를 신규 실행에 사용하지 않는다.
- **C24 — Legacy bootstrap:** 기존 `Bootstrap` RPC는 전환되지 않은
  `agent.canvas.v1` 통화에만 유지한다. legacy와 Orchestration transport를 한
  payload에서 추측하거나 혼합하지 않는다.
- **C25 — Feature gate:** 새 Orchestration 생성·publish, Agent/Orchestration
  실행 대상 연결과 신규 통화 시작은 신형 voice-agent 배포와 계약 breaking
  release가 완료될 때까지 API feature
  gate 뒤에서 비활성화한다. read-only 조회와 선택 전환 UX는 제공할 수 있다.
- **C26 — Draft migration:** 기존 orchestration draft는 실행하지 않고
  read-only로 보존한다. 사용자가 변환 내용을 확인하고 명시적으로 승인한
  경우에만 새 Orchestration draft를 만든다. 원본 draft는 감사와 rollback 판단을
  위해 보존한다.

## 7. 저장소별 상세 계약

- [Web 제품 계약](../../../web/docs/v4/designs/2026-08-07-v4-agent-orchestration-product-contract.md)
- [API 계약](../../../api/docs/v4/designs/2026-08-07-v4-agent-orchestration-api-contract.md)
- [voice-agent 런타임 계약](../../../voice-agent/docs/v2/designs/2026-08-07-v2-agent-orchestration-runtime-contract.md)
- [contracts transport 계약](../../../contracts/docs/contracts/agent-orchestration-v1-transport.md)

## 8. API·voice-agent 추적표

| 공통 ID | API 상세 계약 | voice-agent 상세 계약 |
| --- | --- | --- |
| C01–C03 | Revision과 legacy 거부 | Bootstrap validation과 fail closed |
| C04–C07 | AgentVersion·CallRuntime 소유권 | CallRuntime·AgentRuntime factory |
| C08–C11 | ExecutionTarget과 모드별 validation | direct Agent와 모드별 compiler |
| C12–C15 | publish·통화 routing·Conversation pin | Pinned target만 실행 |
| C16–C18 | Bootstrap projection | CallRuntime·AgentRuntime·Opening 규칙 |
| C19–C22 | 한도·event 필드 계약 | 실패·depth·event 실행 규칙 |
| C23–C24 | RPC 선택과 legacy 분리 | RPC별 별도 decode/compiler |
| C25–C26 | Feature gate와 선택 전환 | 비활성 payload 실행 금지 |

## 9. 변경 통제

이 계약의 의미를 바꾸려면 네 저장소의 공통 파일을 함께 갱신하고
`contractRevision`을 변경해야 한다. 저장소별 상세 문서는 공통 계약을
완화하거나 다른 fallback을 정의할 수 없다.
