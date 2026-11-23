.PHONY: build test test-race web-build web-test all clean

VERSION := 1.15.0
LDFLAGS := -ldflags "-X main.version=$(VERSION)"

build: web-build
	mkdir -p dist
	go build $(LDFLAGS) -o dist/llm-gatego ./cmd/llm-gatego

test:
	go test ./...

test-race:
	go test -race ./...

web-build:
	node scripts/build_web.cjs

web-test:
	cd web && NODE_PATH=$(shell npm root -g) vitest run

all: test web-test build

clean:
	rm -rf dist build/web-dist
