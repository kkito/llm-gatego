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
    "make web-build",
    "make web-typecheck",
    "go test ./...",
    "make web-test",
    "vite@7.3.8",
    "contents: write",
]
missing = [item for item in required if item not in text]
if missing:
    print("workflow missing required fragments: " + ", ".join(missing))
    sys.exit(1)
print("release workflow validation passed")
