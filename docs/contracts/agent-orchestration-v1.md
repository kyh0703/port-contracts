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

- **C04 — Neutral Agent:** Agent는 역할이 없는 재사용 자산이다. Agent는
  Prompt, Greeting, LLM, Tools, MCP, Knowledge, Guardrails를 소유한다. Agent에
  Supervisor, specialist, handoff source/target 같은 역할을 저장하지 않는다.
  역할은 Orchestration 안의 배치가 결정한다.
- **C05 — AgentVersion:** AgentVersion은 해당 Agent의 Prompt, Greeting, LLM,
  도구·MCP snapshot, Knowledge revision, Guardrails를 불변으로 고정한다. 모든
  실행 Agent와 AgentTask는 자신에게 고정된 LLM을 사용해야 하며 전역 LLM
  fallback을 사용해서는 안 된다.
- **C06 — No CallRuntime ownership:** Agent, AgentVersion, AgentRuntime은
  Transport, STT, TTS, Voice, VAD, BackgroundAudio, DTMF 입력, 인터럽션,
  통화 시간 또는 타임아웃을 소유하거나 재구성하지 않는다.
- **C07 — CallRuntime ownership:** 현재 `userId`는 mutable한
  `CallRuntimeConfig` singleton 하나를 소유한다. 별도 named profile이나
  Agent별 통화 설정 객체를 만들지 않는다. CallRuntimeConfig는 Transport,
  VAD, STT, Voice를 포함한 TTS, BackgroundAudio preset·volume, DTMF 입력,
  인터럽션, 최대 통화 시간과 각종 타임아웃의 유일한 영속 설정 경계다.

런타임 모델은 다음 두 경계로 고정한다.

```text
CallRuntime — Conversation당 runtime instance 하나
├─ Transport
├─ VAD
├─ STT
├─ TTS
│  └─ Voice
├─ BackgroundAudio
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

ExecutionTarget 종류와 무관하게 통화 시작 시 현재 CallRuntimeConfig 전체를
불변 `CallRuntimeSnapshot`으로 고정하고, 하나의 session-scoped CallRuntime
instance로 materialize한다. AgentRuntime은 pinned AgentVersion에서
materialize하며, 실행 중인 모든 AgentRuntime은 같은 CallRuntime을 공유한다.
AgentVersion의 Prompt·Guardrails는 Instructions, LLM은 LLMWorker, 도구와 MCP
binding은 각각 Tools와 MCP의 입력이다. Context는 AgentVersion의 소유 자산이
아니라 AgentRuntime이 실행 중 관리하는 상태다.

CallRuntimeConfig와 CallRuntimeSnapshot은 다음 값을 명시적으로 포함한다.

- `backgroundAudio.preset`: `none | cafe | office | contact_center | library`,
  기본값 `none`
- `backgroundAudio.volume`: BackgroundAudio에만 적용되는 `0..1` 값,
  기본값 `0.5`
- `dtmf.timeoutSeconds`: 마지막 DTMF 키 입력 뒤 추가 입력을 기다리는 `1..10`
  범위의 초 단위 정수, 기본값 `3`
- `dtmf.endKey`: `null | 0..9 | # | *`, 기본값 `null`

`backgroundAudio.preset = none`이면 volume 값과 무관하게 재생하지 않는다.
BackgroundAudio preset은 named CallRuntimeConfig profile이나 사용자 입력 URL이
아니라 runtime이 소유한 system preset이다. DTMF timeout은 키 입력마다 다시
시작하며, 설정된 end key는 결과에 포함하지 않고 입력 수집을 즉시 완료한다.
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

- **C12 — Immutable OrchestrationVersion:** OrchestrationVersion은 모드, 정확한
  AgentVersion 참조, 모드별 관계와 orchestration 한도를 불변 snapshot으로
  고정한다. CallRuntimeConfig나 CallRuntimeSnapshot은 소유하지 않는다.
- **C13 — Publish isolation:** Orchestration이 참조하는 Agent를 변경해도 이미
  production인 OrchestrationVersion의 AgentVersion 참조는 바뀌지 않으며 적용하려면
  Orchestration을 다시 publish해야 한다. CallRuntimeConfig 변경은 Orchestration
  publish와 독립적이며 다음 Conversation 시작 시 Agent와 Orchestration 실행 모두에
  적용된다.
- **C14 — Call routing:** 전화번호와 WebRTC 통화 관리는 Agent 또는 Orchestration
  중 정확히 하나를 ExecutionTarget으로 가리킨다. AgentVersion이나
  OrchestrationVersion을 직접 설정 대상으로 노출하지 않는다.
- **C15 — Conversation pin:** Conversation은 시작 시 ExecutionTarget을
  해석해 정확히 하나의 AgentVersion 또는 OrchestrationVersion을 고정하고, 같은
  transaction 경계에서 현재 CallRuntimeConfig 전체를 CallRuntimeSnapshot으로
  고정한다. 이후 publish나 설정 변경은 진행 중 통화에 소급되지 않는다.

## 5. Runtime 불변식

- **C16 — One CallRuntime:** Transport, VAD, STT, TTS와 그 Voice, 인터럽션,
  BackgroundAudio, DTMF 입력 수집, 통화 한도·타임아웃은 pinned
  CallRuntimeSnapshot으로 통화 시작 시 한 번 생성한다. Agent 전환이나
  AgentTask 실행 중 player, listener 또는 policy를 교체하지 않는다. Voice를
  TTS와 분리된 Agent별 runtime으로 만들지 않는다.
- **C17 — Greeting:** 최초 활성 Agent는 자신의 Greeting을 실행할 수 있다.
  Supervisor가 호출한 전문 Agent는 고객과 대화할 수 있지만 일반 Agent
  Greeting을 자동 재생하지 않는다. handoff 대상 Agent는 자신의 Greeting을
  실행할 수 있다.
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
| C16–C18 | Bootstrap projection | CallRuntime·AgentRuntime·Greeting 규칙 |
| C19–C22 | 한도·event 필드 계약 | 실패·depth·event 실행 규칙 |
| C23–C24 | RPC 선택과 legacy 분리 | RPC별 별도 decode/compiler |
| C25–C26 | Feature gate와 선택 전환 | 비활성 payload 실행 금지 |

## 9. 변경 통제

이 계약의 의미를 바꾸려면 네 저장소의 공통 파일을 함께 갱신하고
`contractRevision`을 변경해야 한다. 저장소별 상세 문서는 공통 계약을
완화하거나 다른 fallback을 정의할 수 없다.
