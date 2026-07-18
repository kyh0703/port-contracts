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

`port/api/v1/voice_runtime.proto` is the API's internal voice-runtime
contract. `VoiceRuntimeService.ResolveLease` is consumed by `voice-agent` to
resolve a dispatch-bound runtime lease; it is not a browser-facing API.

```ts
import { VoiceRuntimeServiceClient } from '@overthinker1127/port-contracts/gen/ts/port/api/v1/voice_runtime'
```

## Go

Example import:

```go
import apiv1 "github.com/kyh0703/port-contracts/gen/go/port/api/v1"
```

Validation:

```go
import "github.com/kyh0703/port-contracts/validation"

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
