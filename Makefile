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

NPM_GLOBAL := $(shell npm root -g)
FLUENT_DEPS := @fluentui/web-components @fluentui/tokens @microsoft/fast-element @microsoft/focusgroup-polyfill tslib @swc/helpers

web-deps:
	mkdir -p web/node_modules/@fluentui web/node_modules/@microsoft web/node_modules/@swc
	@for p in $(FLUENT_DEPS); do \
		if [ ! -e "web/node_modules/$$p" ]; then ln -s "$(NPM_GLOBAL)/$$p" "web/node_modules/$$p"; fi; \
	done

web-build: web-deps
	NODE_PATH=$(NPM_GLOBAL) node scripts/build_web.cjs

web-test: web-deps
	cd web && NODE_PATH=$(NPM_GLOBAL) vitest run

all: test web-test build

clean:
	rm -rf dist build/web-dist
