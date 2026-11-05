# State

current_version: contracts-10.8.2
last_updated: 2026-11-05

## 음성 보정 미리보기 공유 matcher — 10.8.2

- STT 태그별 후보 판정과 TTS 스트림의 literal 치환 핵심을 브라우저에서도
  사용하는 공통 `speech-correction` 모듈로 옮겼다. worker와 화면이 같은 구현을 쓴다.
- 기존 STT 임계값·모호성, TTS 청크 경계·취소·캐시 동작은 유지한다.
  실제 matcher smoke에서 `왕십니 → 왕십리점`, `500ml를 html → 500밀리리터를 html` 확인.
- 미리보기는 STT 인식 결과 전체 자동 수정이나 실제 TTS 음성을 뜻하지 않는다.

## Liquid 입력 필수성 분리 — 10.8.1

- inspector가 전체 외부 참조 `variables`와 무조건 엄격하게 평가되는
  `requiredVariables`를 함께 반환한다. 조건·기본값에서 생략 가능한 값과
  직접 출력·엄격한 필터 인수·range 경계를 구분한다.
- Liquid 내부 `offset: continue`를 사용자 입력으로 수집하지 않는다.
- 신규 회귀에서 필수성 메타데이터 누락 RED를 확인한 뒤 shared 전체 검사를 통과했다.
  실제 실행에서 default 입력은 생략해도 `고객`, upcase 입력은 필수,
  loop-resume의 입력 목록에는 `items`만 남는 것을 확인했다.
- 기존 실행 제한·자료 재평가 금지·wire 형식은 변경하지 않았다.

## 제한된 공통 Liquid 엔진 — 10.8.0

- `@overthinker1127/port-contracts/templates`에 inspect/render와 안전한 오류 형식을 제공한다.
  API·worker·Web이 LiquidJS 10.30.1의 같은 제한된 문법과 실행 경계를 사용한다.
- 작성 문구만 실행한다. 조건·필터·반복, 한글·날짜 별칭, flat dotted key를 지원하고
  입력 데이터의 재평가, 파일 접근, prototype 접근, 임의 JS와 무제한 자원 사용을 거부한다.
- `AgentInstructions.literal_context` field 2로 지시문과 참고자료를 분리했다.
  기존 retained Space 원본에서 경계가 모호하면 실행을 거부하며 hash를 고쳐 쓰지 않는다.
- 실제 기존 렌더러의 조건문 미처리 RED, wire의 literalContext 누락 RED를 확인했다.
  새 engine 48개와 기존 wire 53개, TypeScript 빌드·Buf lint·Go 전체 테스트 통과.
  실제 wire/render smoke에서 변수 속 `{{secret}}`와 참고자료 속 include 구문이 그대로 남았다.
- 운영 배포·registry 발행은 하지 않았다.

## TTS 발음 보정 — 10.7.0

- 선택적 `PublishedAgentNodeRuntime.tts_pronunciation` field 21과
  `TtsPronunciationConfig` / `TtsPronunciationEntry`를 추가했다.
- `entries`는 1–200개, `text`는 최대 128자, `pronunciation`은 최대 256자이며
  원문 exact 중복·공백·제어 문자를 거부한다. STT field 20과 독립적이다.
- 대소문자를 구분하는 literal 치환이며 긴 일치 우선·재귀 치환 없음.
  런타임은 TTS 입력만 바꾸고 LLM 답변·대화 기록은 보존한다.
- protobuf 실제 왕복에서 기존 field 누락 RED와 신규 보존 GREEN을 확인했다.
  Buf lint, TS/Go/Python 생성, TypeScript 빌드, wire 53개, Go 전체 테스트 통과.
- API·Web·worker 작업본은 같은 10.7.0 archive를 사용한다.
  registry 발행·운영 배포는 수행하지 않았다.

## 태그별 로컬 유사음 보정 — 10.6.0

- `PublishedAgentNodeRuntime.phonetic_correction`을 선택적 field 20으로 추가했다.
  태그별 `value`/`aliases` 목록과 선택적 유사도·격차 기준만 전달한다.
  외부 API 연결·RPC·URL·credentials·`api_value`를 추가하지 않는다.
- 태그/표준값 exact 중복, Unicode 길이·공백·제어 문자, 배열 크기·임계값을
  protobuf 제약으로 검사한다. 전체 항목 5,000개 상한은 API/worker가 추가로 검사한다.
- Buf lint, TS/Go/Python 생성, TypeScript 빌드, 기존 wire 53개와 Go 전체 테스트가 통과했다.
  새 메시지를 실제 Protovalidate에 넣은 8개 정상·거부 시나리오도 통과했다.
- API·Web·worker가 같은 10.6.0 archive를 사용한다. SHA-256:
  `78598ea405da1741618a727374b4fa468aafb840ef327601f186999cc1fa6ae6`.
  실제 Space HTTP 저장·PG 발행·API mapper의 protobuf를 worker native 세션에 전달해 보정을 확인했다.
  admission/lease·provider·LLM 경계는 로컬 fixture이며 운영 배포·registry 발행 검증은 아니다.
- 2026-11-04 독립 코드리뷰에서 protobuf 호환성의 추가 결함은 찾지 못했다.
  main 통합 전 Buf lint·wire 53개·Go 전체 테스트를 다시 실행해 통과했다.

## Goal-routed Supervisor — 10.5.0

- `PublishedGoalRoute`와 supervisor의 repeated `goal_routes`를 추가했다.
  Goal ID/제목/조건과 기존 specialist relation/tool name을 배포본에 고정한다.
  Bootstrap은 새 `execution-publication-2026-10-31-r3`를 인식하며 r1/r2 의미는 유지한다.
- Buf lint, TS/Go/Python 생성, TypeScript 빌드와 기존 wire 53개가 통과했다.
  별도 실제 protobuf round-trip에서 Goal 경로 누락 RED와 정확한 대상 복원 GREEN을 확인했다.
- API·worker가 같은 로컬 10.5.0 archive를 사용한다. SHA-256:
  `5dc9be6fd247c77a88787adcb4d95f049e3665257925e578cdc36cf2fc9bc8fb`.
  npm 공개 발행은 하지 않는다. 사용자 후속 승인 범위는 검증된 소스의 main 통합·push다.

## 한국 주소·장소 검색 — 10.4.0, 격리 검증

- `BuiltInTool.search_address`는 새 field 7이며 기존 field 1–6은 유지한다.
  `SearchAddressTool`은 호출 조건과 원래 flat 도구의 `tool_reference`만 전달한다.
- 새 worker 전용 `SearchRuntimeAddress`는 owner·node·tool reference와
  `query`·`search_type`을 받고 최대 16KiB의 `AddressSearchResult` JSON을 반환한다.
  공급자 키·URL·좌표는 이 계약에 포함하지 않는다.
- Buf lint·TS/Go/Python 생성·TypeScript 빌드·53개 wire 테스트와 새 Go validation
  회귀가 통과했다. 실제 generated gRPC server/client smoke에서 성공 응답,
  구 API의 미지원 오류, 클라이언트 취소 전파를 확인했다.
- API·worker는 같은 `10.4.0` archive를 사용한다. SHA-256:
  `6ea3aef59fe924c65e41e9fbfbd12fc51b6b3056c00de47384b5e12c6f2319af`.
  두 소비자의 TypeScript 검사와 API bootstrap projection 33개 테스트가 통과했다.
- 위 검증은 main 통합 전 작업본에서 수행했다. npm 발행·운영 배포·실제 Kakao 조회는 하지 않았다.
  운영 호출에는 Local 키/권한과 LLM·대화록·checkpoint 사용 허용 확인이 별도로 필요하다.

## Parallel validation tests

- Independent Go contract validation tests use `t.Parallel()`; shared subtests
  retain their order. `go test -race -count=1 ./...` passed.
- Node 24 wire tests passed through `npm run test:wire`; publication and
  deployment were not performed.

## Agent-generated opening — source only

- Removed `PublishedAgentNodeRuntime.greeting` and reserved field 17 and its name.
- Regenerated TypeScript, Go, and Python bindings with `npm run generate`.
  The wire regression now covers ignoring historical binary/JSON greeting values.
- The opening-only change did not bump the package or replace existing archives.
  The coordinated8.2.0 context release below includes that retirement; API and
  worker adopt its newly built archive together, rather than changing an8.1.0 archive.
- Existing persisted greetings remain inert. Opening content is generated from
  instructions and conversation context, never from a fixed default phrase.
- Verification of the opening-only change: protobuf lint, TypeScript build,
  all42 wire tests and `go test ./...` passed. Registry publication and deployment
  remained separate.

## Personal conversation context — 8.2.0, source only

- Added optional node `context_tool` field 19, optional model
  `history_max_bytes` field 4, and owner-authorized `ReadRuntimeContext`.
  UTF-8 JSON budgets, current-publication/node references and optional feature
  presence are explicit. Existing execution modes and publication revisions remain.
- Regenerated canonical TypeScript/Go/Python bindings. Buf lint and breaking
  compatibility passed; TypeScript build and 42 existing wire cases passed.
  Go tests/vet and Python generated-source syntax compilation passed.
  A temporary 8.1-failing/8.2-passing program exercised the actual new wire fields.
- API and worker consume the identical local8.2.0 archive, SHA-256
  `cf6b322e5e0c653bf30d83757298f98207e3304f458f6d89f707821d392a5813`.
  The API's exact Docker deps stage completed its frozen Node24/pnpm10.26.0 install.
- No package registry publication, production change, schema migration or main
  integration occurred. Matching API/worker must precede new personal presets.

## Number-ending EOT wait — 8.1.0, source only

- Added optional double `SpeechPolicyRuntime.eot_on_number_secs`, field 3,
  constrained to 0–3 seconds. TypeScript uses `eotOnNumberSecs`; omission is
  distinct from explicit zero so the worker can apply default 0.5 or disable.
- Regenerated TypeScript, Go and Python bindings. The binary/JSON presence
  regression failed four configured-value cases before generation; all 42 wire
  tests and Go validation passed, including finite bounds and missing/zero.
- API and worker consume the same local 8.1.0 tarball with SHA-256
  `0dad6ba795c975f7d51e01e247f8298e4786fcaa4f2d6b14e33593b0bda8c54d`.
  Main publication is source-only; registry publication and production rollout remain separate.

## MCP timeout extension — 7.17.0

- `McpServerRuntime.timeout_ms` is optional uint32 field 5, constrained to
  1000..600000 when present. Existing headers remain field 4.
- Regenerated TypeScript, Go and Python bindings. API and voice runtime use
  the locally vendored 7.17.0 package; no registry publication performed.
- Two wire tests passed: boundary values and headers survive binary/JSON
  roundtrips; omitted timeout remains absent and explicit zero retains presence
  for validation. A real MCP SDK network smoke consumed this package through
  runtime materialization and preserved configured headers and call deadlines.

## Active

The canonical worker boundary is `proto/port/api/v1/agent_session.proto` plus
`runtime_identity.proto`. `ExecutionSessionService.BootstrapPublished` returns
one pinned Supervisor/Handoff graph, typed prompt variables, transport runtime
and mandatory owner lease. Publication revision
`execution-publication-2026-09-15-r2` is current; the explicitly admitted legacy
revision is `execution-publication-2026-09-04-r1`. HA protocol
`runtime-recovery-v1` is independent of publication and npm versions.

Contracts8.2.0 adds typed personal-context lookup and an optional history-view
budget without a new execution mode. The HTTP personal principal and scoped
immutable sources remain API-owned; a retrieved payload grants no role or effect.

`Bootstrap`, `BootstrapAgent`, `BootstrapOrchestration` and the old
`orchestration-2026-08-07-r4` runtime are retired, with no fallback aliases.
The earlier `docs/contracts/agent-orchestration-v1*.md` and
`docs/orchestration-contract-v1/` records describe historical orchestration,
not the current worker integration.

