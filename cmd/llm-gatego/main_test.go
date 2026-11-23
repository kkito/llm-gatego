package main

import (
	"bytes"
	"strings"
	"testing"
)

func TestVersionOutput(t *testing.T) {
	oldVersion := version
	version = "9.9.9"
	defer func() { version = oldVersion }()

	var buf bytes.Buffer
	run([]string{"-version"}, &buf)
	got := buf.String()
	if !strings.Contains(got, "9.9.9") {
		t.Fatalf("expected version in output, got %q", got)
	}
}
