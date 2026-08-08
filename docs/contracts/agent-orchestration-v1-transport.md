---
contract: agent-orchestration-v1-transport
contract_revision: orchestration-2026-08-07-r4
status: released
owner: contracts
supersedes:
  - contracts@1.8.0 agent.orchestration.v1 graph transport
---

# Agent·Orchestration protobuf transport 계약

이 문서는 [공통 계약](./agent-orchestration-v1.md)을 protobuf transport로 옮긴
message 경계와 legacy 분리를 설명한다. 이 경계는 `contracts@2.0.0`으로 출시됐고,
`2.1.0` 후보에서 STT keyterms와 API tool runtime credential을 additive로
보강한다.

## Released boundary

`contracts@1.8.0`에 추가된 `BootstrapResponse.orchestration_graph`와
`OrchestrationGraphSnapshot` 계열은 역사적 retired 계약이다. schema 문자열
`agent.orchestration.v1`은 제품 명칭으로 유지하지만 과거 wire shape을 새
Orchestration shape로 해석하지 않는다.

새 transport는 `contract_revision = "orchestration-2026-08-07-r4"`를 필수로 하고
누락 또는 다른 값을 거부한다. 이 변경은 additive optional field가 아니라
`contracts@2.0.0` breaking package release로 발행됐다. `2.1.0` 후보는 revision과
schema 명칭을 유지하고 기존 field number를 바꾸지 않는다.

## RPC 경계

개념적 서비스 경계는 다음과 같다.

```proto
rpc Bootstrap(BootstrapRequest) returns (BootstrapResponse);
rpc BootstrapAgent(BootstrapAgentRequest)
    returns (BootstrapAgentResponse);
rpc BootstrapOrchestration(BootstrapOrchestrationRequest)
    returns (BootstrapOrchestrationResponse);
```

- `Bootstrap`은 전환되지 않은 `agent.canvas.v1` Conversation 전용이다.
- `BootstrapAgent`는 pinned AgentVersion을 가진 direct Agent Conversation
  전용이다.
- `BootstrapOrchestration`은 pinned OrchestrationVersion을 가진 multi-Agent
  Conversation 전용이다.
- 요청 하나를 다른 RPC에 재시도하거나 response shape를 서로 fallback하지
  않는다.
- 신규 response에는 legacy `orchestration_graph`를 포함하지 않는다.

## `BootstrapAgentRequest/Response`

request는 `conversation_id`, `session_id`, pinned `agent_version_id`, 요청한
`contract_revision`과 기존 내부 인증 binding을 가진다. response는
CallRuntimeSnapshot 하나와 AgentRuntime 입력 하나를 전달하며 mode 또는 transition
snapshot을 포함하지 않는다.

## `BootstrapOrchestrationRequest`

request는 기존 내부 인증·일회성 bootstrap 경계를 재사용하되 최소한 다음
binding을 검증할 수 있어야 한다.

- bootstrap ticket 또는 검증된 SIP job identity
- `conversation_id`
- `session_id`
- pinned `orchestration_version_id`
- 요청한 `contract_revision`

request의 OrchestrationVersion과 Conversation pin이 다르면 거부한다.

## `BootstrapOrchestrationResponse`

response는 다음 최상위 구조를 가진다.

```text
BootstrapOrchestrationResponse
├── contractRevision = "orchestration-2026-08-07-r4"
├── schemaVersion = "agent.orchestration.v1"
├── conversation/session binding
├── orchestrationId / orchestrationVersionId
├── mode
├── callRuntime
├── agentRuntimes[]
└── exactly one mode snapshot
    ├── supervisor
    └── handoff
```

mode와 mode snapshot은 일치해야 하고 exactly-one 제약을 wire validation과
consumer validation 양쪽에서 확인한다.

## CallRuntimeSnapshot

`call_runtime`은 API가 Conversation 시작 시 현재 CallRuntimeConfig 전체에서
고정한 CallRuntimeSnapshot을 한 번만 전달한다. 이 snapshot은
OrchestrationVersion이나 AgentVersion의 일부가 아니다.

- Transport와 session binding
- VAD/endpointing runtime
- STT runtime
  - 순서를 보존하는 non-empty keyterms 목록
- TTS runtime과 그 하위 Voice
- BackgroundAudio runtime
- DTMF input runtime
- 인터럽션 policy
- 최대 통화 시간과 timeout

Voice는 TTS와 별도의 top-level field가 아니다. 이 값은 AgentRuntime message
안에 중복하지 않는다. provider credential은 기존
worker-only 단기 bootstrap 보안 경계 안에서만 전달하며 저장·로그용 message와
구분한다.

BackgroundAudio와 DTMF는 `call_runtime` 안의 required message로 전달한다.
개념적 wire shape는 다음과 같다.

```proto
enum BackgroundAudioPreset {
  BACKGROUND_AUDIO_PRESET_UNSPECIFIED = 0;
  BACKGROUND_AUDIO_PRESET_NONE = 1;
  BACKGROUND_AUDIO_PRESET_CAFE = 2;
  BACKGROUND_AUDIO_PRESET_OFFICE = 3;
  BACKGROUND_AUDIO_PRESET_CONTACT_CENTER = 4;
  BACKGROUND_AUDIO_PRESET_LIBRARY = 5;
}

message BackgroundAudioRuntime {
  BackgroundAudioPreset preset = 1;
  optional double volume = 2;
}

message DtmfInputRuntime {
  uint32 timeout_seconds = 1;
  optional string end_key = 2;
}
```

`BACKGROUND_AUDIO_PRESET_UNSPECIFIED`, 누락된 volume, `0..1` 밖의 volume,
`1..10` 밖의 timeout 또는 `[0-9#*]` 한 글자가 아닌 end key는 거부한다.
HTTP의 `endKey = null`은 wire에서 `end_key` absence로 표현한다. `preset = NONE`은
명시적 비활성이고 volume은 유효한 설정값으로 유지한다. preset 값은 raw 파일
경로·URL이 아니다.

## AgentRuntime 입력

`agent_runtimes[]`의 각 항목은 다음 AgentRuntime 구성 입력을 고정한다.

- `agent_id`, `agent_version_id`
- 필수 `LLMWorker` 구성
- Prompt와 Guardrails에서 만든 `Instructions` 입력
- Conversation binding과 mode별 `Context` 초기화 policy
- `Tools` snapshot
- MCP binding snapshot
- API tool별 단기 header credential
- Greeting과 활성화 policy
- `knowledge_revision_id`와 필요한 immutable retrieval binding

Context의 대화 상태 자체는 wire snapshot에 고정된 Agent 자산이 아니라 실행 중
AgentRuntime이 관리한다. AgentRuntime에는 Transport, STT, TTS, Voice, VAD,
BackgroundAudio, DTMF 입력, 인터럽션 또는 통화 timeout 필드를 두지 않는다.
LLMWorker는 optional이 아니며 전역 LLM field를 제공하지 않는다.

API tool의 URL·schema·설명은 `tools[]` metadata에 두고, 실행 시점의 단기 header는
`api_tool_runtimes[]`에 분리한다. 각 `kind = "api"` tool은 같은 `tool_id`의 runtime
하나와 정확히 대응해야 한다. MCP tool은 이 목록의 대상이 아니며, 중복·누락·
dangling runtime과 API runtime이 MCP tool을 참조하는 kind mismatch를 거부한다.
credential 값은 validation 오류나 로그에 포함하지 않는다.

## 모드별 snapshot

### Supervisor snapshot

- `supervisor_agent_version_id` 하나
- `specialists[]`
  - relation ID
  - target `agent_version_id`
  - 비어 있지 않은 route description
  - `context_policy`, 누락 시 producer가 `conversation`으로 materialize

전문 Agent relation 안에 outgoing relation이나 handoff를 표현하지 않는다.
AgentTask는 wire node가 아니라 호출마다 target AgentVersion에서 생성되는
runtime 단위다.

### Handoff snapshot

- `entry_agent_version_id` 하나
- 양의 `max_handoff_depth`
- `routes[]`
  - transition ID
  - source/target `agent_version_id`
  - 비어 있지 않은 routing description
  - `context_policy: conversation | none`
  - optional announcement

handoff snapshot에 AgentTask/delegate relation을 표현하지 않는다.

## Validation과 unknown 값

- `single`을 포함한 unknown mode, unknown context policy, 빈 ID, LLMWorker
  누락, 잘못된 MCP snapshot,
  mode/snapshot 불일치, 중복 relation과 `max_handoff_depth = 0`을 거부한다.
- 신규 required semantic을 proto3 scalar default로 조용히 수용하지 않는다.
  message presence, enum sentinel, protovalidate와 consumer cross-field 검증을
  함께 사용한다.
- BackgroundAudio와 DTMF message 누락, unknown preset, volume·timeout 범위 오류,
  유효하지 않은 end key를 거부한다.
- STT keyterms의 빈 항목을 거부한다. 빈 목록은 정상이며 기존 `2.0.0` payload를
  decode하면 빈 목록이 된다.
- AgentRuntime의 API tool metadata와 runtime credential은 `tool_id` 기준 양방향
  1:1이어야 한다. MCP tool은 runtime credential을 요구하지 않는다.
- producer가 잘못된 신규 response를 만들면 legacy response로 다시 보내지
  않는다.
- consumer는 알 수 없는 revision을 best-effort로 실행하지 않는다.

## Legacy transport 보존 범위

기존 `BootstrapResponse`, `CanvasSnapshot`, `WorkerSnapshot`과 기존 field number는
전환되지 않은 `agent.canvas.v1` 통화를 위해 유지할 수 있다. 다만 다음은
금지한다.

- 신규 Orchestration을 `BootstrapResponse.orchestration_graph`에 투영
- `contracts@1.8.0` graph를 새 revision으로 간주
- node별 TTS/Voice 또는 mixed delegate/handoff 의미를 새 response에 복사
- BackgroundAudio 또는 DTMF를 AgentRuntime이나 mode snapshot에 복사
- RPC 실패 시 다른 RPC를 암묵적으로 호출

## Release와 additive 검증

`2.0.0` release와 `2.1.0` additive 후보는 최소한 다음 fixture를 포함한다.

- direct Agent, supervisor, handoff response의 언어별 round trip
- mode별 exactly-one과 required LLM validation
- CallRuntimeSnapshot이 AgentRuntime 사이에 중복되지 않음
- BackgroundAudio preset 전체와 volume `0`, `1`, 범위 밖 fixture
- DTMF timeout 경계와 absent·`#`·`*`·invalid end key fixture
- direct Agent와 두 Orchestration mode가 같은 pinned BackgroundAudio·DTMF
  snapshot을 전달하고 raw DTMF 입력을 로그·event에 기록하지 않음
- revision 누락·불일치 거부
- 신규 payload가 legacy decoder/compiler로 fallback하지 않음
- 기존 `agent.canvas.v1` fixture가 기존 `Bootstrap`에서만 계속 동작
- direct Agent, supervisor, handoff의 STT keyterms 순서·값 round trip
- API tool 2개와 MCP tool이 함께 있을 때 API runtime만 정확히 1:1 대응
- API runtime missing·duplicate·dangling·kind mismatch·orphan 거부
- `2.0.0` wire layout decode 시 신규 repeated field가 빈 목록으로 초기화

`2.0.0`의 breaking change와 소비자 동시 전환은 release note에 기록한다.
`2.1.0` 후보는 기존 r4 field와 revision을 보존하며, package publish와 소비자
업데이트는 최종 검증 뒤 진행한다.
