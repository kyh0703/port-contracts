BUF_IMAGE ?= bufbuild/buf:latest

.PHONY: deps generate lint breaking build check docker-deps docker-generate docker-lint

deps:
	buf dep update

generate:
	buf generate

lint:
	buf lint

breaking:
	buf breaking --against '.git#branch=main'

build:
	npm run build

check:
	npm run check

docker-generate:
	docker run --rm -v "$$(pwd):/workspace" -w /workspace $(BUF_IMAGE) generate

docker-deps:
	docker run --rm -v "$$(pwd):/workspace" -w /workspace $(BUF_IMAGE) dep update

docker-lint:
	docker run --rm -v "$$(pwd):/workspace" -w /workspace $(BUF_IMAGE) lint
