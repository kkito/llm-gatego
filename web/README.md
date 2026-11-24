## 通用的内置界面方案

针对应用的 UI 界面，这里尝试构建一套开发高效、可测试、可维护、简单、体积小、速度快，同时保留 SPA/双向绑定 等现代 Web 体验的方案。

## 功能点

- 使用 Go 标准库 `net/http` 实现内置 Web 服务器
- 使用 esbuild 打包并压缩 JS/CSS/HTML，并使用 `go:embed` 将前端构建产物嵌入 Go 二进制
- 使用 TypeScript + Lit 实现 Web Components 组件化
- 使用手写轻量 router 实现 SPA
- 支持 `history.pushState` / `popstate`, 服务端提供 SPA fallback：除 `/api/...`、静态资源外，其他页面路径返回 `index.html`
- 使用 `tsc --noEmit` 做 TypeScript 类型检查
- 使用 Vitest + happy-dom 做 DOM/路由/构建产物测试
- 开发时使用 Vite dev server + HMR，`/api` 请求代理到本地 Go 服务

## 本地开发

先启动 Go 服务（`:4000`），再运行：

```bash
make web-dev
```

然后打开 `http://localhost:5173/admin/models`。Vite 只用于开发，发布构建仍使用 `make build`。
