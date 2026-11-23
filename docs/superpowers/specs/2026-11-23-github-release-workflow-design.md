# GitHub Release 自动构建 Workflow 设计

## 背景

`llm-gatego` 是 Go 单二进制网关，Web 前端资源通过 `internal/server/dist` 以 `//go:embed all:dist` 嵌入最终二进制。

当前构建命令来自 `Makefile`：

```make
web-build:
	NODE_PATH=$(shell npm root -g) node scripts/build_web.cjs

build: web-build
	mkdir -p dist
	go build $(LDFLAGS) -o dist/llm-gatego ./cmd/llm-gatego
```

项目尚未配置 `.github/workflows`。

用户希望：

- 不在本地手动打 tag 后由 push tag 触发
- 在 GitHub Web 页面创建并发布 Release 时触发构建
- 自动构建 3 个平台二进制并上传到该 Release
- 目标分支语义为 `main`

## 目标

新增一个 GitHub Actions workflow：

```text
.github/workflows/release.yml
```

行为如下：

1. 当 GitHub Release 被点击 **Publish release** 时触发
2. 检出该 Release 对应代码
3. 校验 Release 对应 commit 可由 `origin/main` 到达
4. 安装 Go、Node 与全局前端工具
5. 运行 Go 测试与 Web 测试
6. 构建一次 Web 资源
7. 使用同一份 Web 资源交叉编译 3 个 Go 二进制
8. 将 3 个二进制上传到当前 Release

## 触发器

使用：

```yaml
on:
  release:
    types: [published]
```

不使用：

```yaml
on:
  push:
    tags:
      - 'v*'
```

原因：用户明确要求在 GitHub Release 页面发布时触发，而不是 push tag 时触发。

## 产物

发布以下 3 个 Release assets：

```text
llm-gatego-linux-amd64
llm-gatego-darwin-amd64
llm-gatego-darwin-arm64
```

对应构建参数：

| 文件 | GOOS | GOARCH |
|---|---|---|
| `llm-gatego-linux-amd64` | `linux` | `amd64` |
| `llm-gatego-darwin-amd64` | `darwin` | `amd64` |
| `llm-gatego-darwin-arm64` | `darwin` | `arm64` |

## 版本注入

当前 `Makefile` 使用硬编码：

```make
VERSION := 1.15.0
LDFLAGS := -ldflags "-X main.version=$(VERSION)"
```

Release workflow 不从 Makefile 读取该版本，而从 Release tag 取版本：

```bash
VERSION="${GITHUB_REF_NAME#v}"
```

例如：

```text
Release tag: v1.15.0
二进制 version: 1.15.0
```

构建命令使用：

```bash
CGO_ENABLED=0 GOOS=... GOARCH=... go build \
  -trimpath \
  -ldflags "-s -w -X main.version=${VERSION}" \
  -o dist/<asset-name> \
  ./cmd/llm-gatego
```

## 分支校验

Release 页面可以选择 tag 对应的 commit。为了满足“main 分支发布”的语义，workflow 在构建前执行：

```bash
git fetch origin main --depth=1
git branch -r --contains "$GITHUB_SHA" | grep -q 'origin/main'
```

如果 Release 对应 commit 不在 `main` 历史中，则 workflow 失败，不上传产物。

## 测试

发布前必须运行：

```bash
go test ./...
cd web && NODE_PATH=$(npm root -g) vitest run
```

任一测试失败则 workflow 失败，不上传产物。

## Web 构建

项目没有 `web/package.json`，当前依赖全局安装：

```text
esbuild
typescript
vitest
```

workflow 中安装：

```bash
npm install -g esbuild typescript vitest
```

Web 构建只执行一次：

```bash
NODE_PATH=$(npm root -g) node scripts/build_web.cjs
```

该脚本会生成：

```text
web/dist/*
internal/server/dist/*
```

随后 Go 交叉编译会把 `internal/server/dist` 嵌入每个平台二进制。

## 权限

workflow 需要写入 Release assets：

```yaml
permissions:
  contents: write
```

使用 `softprops/action-gh-release@v2` 上传产物到当前 Release：

```yaml
with:
  files: |
    dist/llm-gatego-linux-amd64
    dist/llm-gatego-darwin-amd64
    dist/llm-gatego-darwin-arm64
  tag_name: ${{ github.event.release.tag_name }}
```

## 错误处理

- Go 测试失败：workflow 失败，不上传
- Web 测试失败：workflow 失败，不上传
- Release commit 不在 main：workflow 失败，不上传
- 任一交叉编译失败：workflow 失败，不上传
- 上传失败：workflow 失败，GitHub Release 页面保留已有内容

## 不做的事

- 不创建新的 Release
- 不在 push tag 时触发
- 不修改 `Makefile`
- 不上传源码压缩包
- 不构建 Windows 版本
- 不做代码签名与公证

## 验收标准

在 GitHub 页面发布一个基于 `main` 的 Release 后：

1. workflow `release.yml` 触发
2. Go 测试和 Web 测试通过
3. 三个二进制构建成功
4. 当前 Release 页面出现 3 个 assets
5. 下载任一二进制可执行：
   ```bash
   chmod +x llm-gatego-<platform>
   ./llm-gatego-<platform> --help
   ```
6. Linux 二进制执行 `-version` 显示的版本号与 Release tag 去掉 `v` 后一致
