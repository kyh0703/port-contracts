# State

current_version: orchestration-contract-v1
last_updated: 2026-08-08

## Active

현재 기준은 [Agent·Orchestration 공통 계약](contracts/agent-orchestration-v1.md)과
[protobuf transport 계약](contracts/agent-orchestration-v1-transport.md)이다.

- 신규 제품은 schema 명칭 `agent.orchestration.v1`과 필수
  `contractRevision = "orchestration-2026-08-07-r4"`를 함께 사용한다.
- `contracts@1.8.0`의 graph 계약은 역사적 retired 계약이다.
- `contracts@2.0.0`은 신규 RPC, r4 response, CallRuntimeSnapshot과 AgentRuntime
  경계를 포함해 출시됐다.
- Agent 직접 실행은 `BootstrapAgent`, Orchestration 실행은
  `BootstrapOrchestration` RPC/response를 사용한다.
- 두 신규 response는 Conversation 시작 시 CallRuntimeConfig에서 고정한
  CallRuntimeSnapshot 하나와 AgentRuntime 입력을 전달한다. BackgroundAudio와
  DTMF 입력 설정은 CallRuntimeSnapshot에만 포함한다.
- 기존 `Bootstrap`은 전환되지 않은 `agent.canvas.v1` 통화에만 유지한다.
- additive `2.1.0` 후보는 `SttRuntime.keyterms`와 AgentRuntime별
  `api_tool_runtimes`를 추가한다. API tool metadata와 runtime credential은 같은
  `tool_id`로 정확히 1:1 대응해야 한다.

`2.1.0` 후보의 protobuf와 Go·TypeScript·Python 생성물, wire 호환성 검증을
완료했다. npm publish, API producer 반영과 voice-agent dependency 업데이트는
별도 단계로 진행한다.
