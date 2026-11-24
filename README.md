# llm-gatego

Go 全量重写版 LLM Gateway，对齐原 `@kkito/llm-gateway` v1.15.0 功能。

## 开发

```bash
make test         # go test ./...
make test-race    # go test -race ./...
make web-test     # vite build + vitest（需全局 vite/vitest/happy-dom）
make web-build    # vite build + 同步到 Go embed 目录
make web-dev      # Vite dev server + HMR
make build        # 构建单二进制 dist/llm-gatego
```

设计文档见 `docs/superpowers/specs/`，架构图见 `docs/*.md`。
