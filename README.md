# port-contracts

Shared protobuf contracts for the `port-*` internal APIs.

## Generate

```bash
buf dep update
buf generate
npm run build
```

Docker-only:

```bash
docker run --rm -v "$PWD:/workspace" -w /workspace bufbuild/buf:latest dep update
make docker-generate
```

## TypeScript

Published package:

```bash
pnpm add @overthinker1127/port-contracts
```

Example import:

```ts
import { ApiEventServiceClient } from '@overthinker1127/port-contracts/gen/ts/port/api/v1/gateway_events'
```

`port/api/v1/agent_session.proto` is the API's worker-only session bootstrap
and transfer control contract. `ExecutionSessionService.BootstrapPublished`
admits either a one-time browser ticket or a verified SIP LiveKit job and returns one exact Agent
supervisor or handoff runtime. The required revision is
`execution-publication-2026-09-04-r1`; the response carries bounded typed
system and per-call user prompt variables, and handoff routes carry typed
parameters, `none | conversation | recent` context policy, and one blocking
`request_start` message. Older Agent bootstrap services and revision fallbacks
are intentionally unavailable.

`7.2.0` adds `ExecutionSessionService.CommandSipTransfer` and optional
`transfer_capability`, `TransferToHumanTool.mode` (`single | consultative`), and
`consultation_timeout_ms`. The API authenticates each command against the
admitted session and resolves the destination from its pinned publication.
Consultation credentials belong only to the worker; the room may use isolated
media permissions within the existing call on self-hosted LiveKit. `ready`
confirms briefing playout, and `accept` carries the exact consultant identity
and voice or DTMF consent source before the API can connect the calls. Missing policy fields retain the API's consultative defaults.
The existing publication revision and field numbers remain unchanged.

```ts
import { ExecutionSessionServiceClient } from '@overthinker1127/port-contracts/gen/ts/port/api/v1/agent_session'
```

## Go

Example import:

```go
import apiv1 "github.com/kyh0703/port-contracts/v4/gen/go/port/api/v1"
```

Validation:

```go
import "github.com/kyh0703/port-contracts/v4/validation"

err := validation.Validate(&apiv1.RecordGatewayEventRequest{
    EventType: apiv1.GatewayLifecycleEventType_GATEWAY_LIFECYCLE_EVENT_TYPE_AGENT_STARTED,
    ConversationId: "conversation-1",
    OccurredAt: timestamppb.Now(),
})
```

The Go output also includes `grpc-gateway` reverse-proxy handlers generated
from `google.api.http` annotations.

## Release

Push a tag like `v0.1.0`. GitHub Actions runs Buf generation, builds the
TypeScript package, and publishes to npm.

GitHub Actions requires an `NPM_TOKEN` repository secret for npm publishing.
