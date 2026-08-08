# Roadmap

## Current Track

[Agent·Orchestration 공통 계약](contracts/agent-orchestration-v1.md)의 r4 transport는
`contracts@2.0.0`으로 출시됐다. 현재는 실행 입력에서 누락된 STT keyterms와
API tool 단기 credential을 additive `2.1.0` 후보로 보강하고 최종 검증을
완료했다.

## Next

1. 승인 후 `2.1.0`을 발행한다. API producer 반영은 API 저장소에서 별도로
   진행한다.
2. voice-agent가 `2.1.0`을 사용해 CallRuntime·AgentRuntime factory와
   direct/supervisor/handoff 실행 경로를 연결한다.

`contractRevision`과 schema 명칭은 바꾸지 않는다. 기존 field number와 legacy
`Bootstrap`을 보존하고 `contracts@1.8.0` graph를 새 Orchestration에 재사용하지
않는다.
