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
import { MediaServiceClient } from '@overthinker1127/port-contracts/gen/ts/port/media/v1/media'
```

## Go

Example import:

```go
import mediav1 "github.com/kyh0703/port-contracts/gen/go/port/media/v1"
```

Validation:

```go
import "github.com/kyh0703/port-contracts/validation"

err := validation.Validate(&mediav1.CreateSessionRequest{
    SessionId: "session-1",
    ConversationId: "conversation-1",
})
```

The Go output also includes `grpc-gateway` reverse-proxy handlers generated
from `google.api.http` annotations.

## Release

Push a tag like `v0.1.0`. GitHub Actions runs Buf generation, builds the
TypeScript package, and publishes to npm.

GitHub Actions requires an `NPM_TOKEN` repository secret for npm publishing.
