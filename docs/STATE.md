# State

current_version: orchestration-contract-v1
last_updated: 2026-08-07

## Active

현재 기준은 [Agent·Orchestration 공통 계약](contracts/agent-orchestration-v1.md)과
[protobuf transport 계약](contracts/agent-orchestration-v1-transport.md)이다.

- 신규 제품은 schema 명칭 `agent.orchestration.v1`과 필수
  `contractRevision = "orchestration-2026-08-07-r4"`를 함께 사용한다.
- `contracts@1.8.0`의 graph 계약은 역사적 retired 계약이다.
- Agent 직접 실행은 `BootstrapAgent`, Orchestration 실행은
  `BootstrapOrchestration` RPC/response를 사용한다.
- 두 신규 response는 Conversation 시작 시 CallRuntimeConfig에서 고정한
  CallRuntimeSnapshot 하나와 AgentRuntime 입력을 전달한다. BackgroundAudio와
  DTMF 입력 설정은 CallRuntimeSnapshot에만 포함한다.
- 기존 `Bootstrap`은 전환되지 않은 `agent.canvas.v1` 통화에만 유지한다.
- 실제 proto와 생성물은 문서 리뷰 뒤 breaking release에서 변경한다.

현재 작업은 문서 잠금뿐이며 protobuf, generated artifact, package version을
변경하지 않는다.
