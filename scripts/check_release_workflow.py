#!/usr/bin/env python3
from pathlib import Path
import sys

path = Path(".github/workflows/release.yml")
if not path.exists():
    print("missing .github/workflows/release.yml")
    sys.exit(1)

text = path.read_text()
required = [
    "release:",
    "types: [published]",
    "on:",
    "softprops/action-gh-release@v2",
    "GITHUB_REF_NAME",
    "origin/main",
    "llm-gatego-linux-amd64",
    "llm-gatego-darwin-amd64",
    "llm-gatego-darwin-arm64",
    "NODE_PATH=$(npm root -g) node scripts/build_web.cjs",
    "go test ./...",
    "NODE_PATH=$(npm root -g) vitest run",
    "npm install -g esbuild typescript vitest happy-dom",
    "contents: write",
]
missing = [item for item in required if item not in text]
if missing:
    print("workflow missing required fragments: " + ", ".join(missing))
    sys.exit(1)
print("release workflow validation passed")
