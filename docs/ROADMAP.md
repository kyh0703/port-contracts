# Roadmap

## Current Track

[Agent·Orchestration 공통 계약](contracts/agent-orchestration-v1.md)의 transport 경계를
리뷰하고 잠근다.

## After Documentation Review

1. `BootstrapAgent`, `BootstrapOrchestration` request/response와 mode별 snapshot의 breaking proto
   release plan을 만든다.
2. Go, TypeScript, Python 생성물과 direct Agent/supervisor/handoff wire fixture를
   동기화한다.
3. revision, exactly-one mode, CallRuntime 단일성, AgentRuntime별 필수
   LLMWorker·Instructions·Context·Tools·MCP validation을 추가한다.
4. API와 voice-agent 소비자 배포 순서를 확정한 뒤 breaking tag를 발행한다.

문서 리뷰 전에는 `.proto`, generated artifact, package metadata를 수정하지
않는다. `contracts@1.8.0` graph를 새 Orchestration에 재사용하지 않는다.
