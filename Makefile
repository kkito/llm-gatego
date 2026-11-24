.PHONY: build test test-race web-deps web-build web-test web-typecheck all clean

VERSION := 1.15.0
LDFLAGS := -ldflags "-X main.version=$(VERSION)"

# Full build: bundle web assets first, then embed them into the Go binary.
build: web-build
	mkdir -p dist
	go build $(LDFLAGS) -o dist/llm-gatego ./cmd/llm-gatego

test:
	go test ./...

test-race:
	go test -race ./...

NPM_GLOBAL := $(shell npm root -g)

web-deps:
	@mkdir -p web/node_modules
	@if [ ! -e web/node_modules/lit ]; then ln -s $(NPM_GLOBAL)/lit web/node_modules/lit; fi

web-build: web-deps
	NODE_PATH=$(NPM_GLOBAL) node scripts/build_web.cjs

web-test: web-deps
	cd web && NODE_PATH=$(NPM_GLOBAL) vitest run

web-typecheck: web-deps
	cd web && NODE_PATH=$(NPM_GLOBAL) tsc --noEmit

all: test web-test web-typecheck build

clean:
	rm -rf dist build/web-dist
