package main

import (
	"bytes"
	"io"
	"os"
	"path/filepath"
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

func TestCLISubcommands(t *testing.T) {
	var buf bytes.Buffer
	run([]string{"help"}, &buf)
	if !strings.Contains(buf.String(), "stats") {
		t.Fatal(buf.String())
	}
	buf.Reset()
	run([]string{"-version"}, &buf)
	if !strings.Contains(buf.String(), "llm-gatego") {
		t.Fatal(buf.String())
	}
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "config.json"), []byte(`{"models":[]}`), 0644)
	buf.Reset()
	if err := runE([]string{"stats", "-C", dir, "--json"}, &buf); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(buf.String(), `"total": 0`) {
		t.Fatal(buf.String())
	}
	buf.Reset()
	if err := runE([]string{"stats", "-C", dir, "--date", "2026-01-01", "--by-hour"}, &buf); err != nil {
		t.Fatal(err)
	}
	buf.Reset()
	if err := runE([]string{"stats", "-C", dir, "--week", "2026-W01", "--month", "2026-01"}, &buf); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(pidPath(dir), []byte("99999999"), 0644); err != nil {
		t.Fatal(err)
	}
	if _, err := readPID(dir); err == nil {
		t.Fatal("stale pid not detected")
	}
	buf.Reset()
	if err := runE([]string{"stop", "-C", dir}, &buf); err == nil {
		t.Fatal("stopped non-running process")
	}
}
func TestParseStartFlags(t *testing.T) {
	o, err := parseStart([]string{"-C", "/tmp/cfg", "-p", "5000", "-t", "1000", "--debug"}, io.Discard)
	if err != nil {
		t.Fatal(err)
	}
	if o.configDir != "/tmp/cfg" || o.port != 5000 || o.timeout != 1000 || !o.debug {
		t.Fatalf("%+v", o)
	}
	o, err = parseStart([]string{"--config-dir", "/tmp/c", "--port", "4001"}, io.Discard)
	if err != nil {
		t.Fatal(err)
	}
	if o.port != 4001 || o.configDir != "/tmp/c" {
		t.Fatal(o)
	}
}
