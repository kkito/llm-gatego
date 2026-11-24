.PHONY: build test test-race web-deps web-dev web-build web-test web-typecheck all clean

VERSION := 1.15.0
LDFLAGS := -ldflags "-X main.version=$(VERSION)"

# Full build: bundle web assets first, then embed them into the Go binary.
build: web-build
	mkdir -p dist
	go build $(LDFLAGS) -o dist/llm-gatego ./cmd/llm-gatego

test: web-build
	go test ./...

test-race: web-build
	go test -race ./...

NPM_GLOBAL := $(shell npm root -g)

web-deps:
	@mkdir -p web/node_modules
	@if [ ! -e web/node_modules/lit ]; then ln -s $(NPM_GLOBAL)/lit web/node_modules/lit; fi
	@if [ ! -e web/node_modules/vite ]; then ln -s $(NPM_GLOBAL)/vite web/node_modules/vite; fi

web-dev: web-deps
	cd web && NODE_PATH=$(NPM_GLOBAL) vite

web-build: web-deps
	cd web && NODE_PATH=$(NPM_GLOBAL) vite build
	rm -rf internal/server/dist
	mkdir -p internal/server/dist
	cp -R web/dist/. internal/server/dist/
	touch internal/server/dist/.gitkeep

web-test: web-build
	cd web && NODE_PATH=$(NPM_GLOBAL) vitest run

web-typecheck: web-deps
	cd web && NODE_PATH=$(NPM_GLOBAL) tsc --noEmit

all: web-build test web-typecheck web-test build

clean:
	rm -rf dist build/web-dist
