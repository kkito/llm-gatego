package logger

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestLoggerWritesJSONLine(t *testing.T) {
	dir := t.TempDir()
	l := NewLogger(dir, "test.log")
	if err := l.Log(LogEntry{RequestID: "r1", CustomModel: "m", Endpoint: "/v1/messages", StatusCode: 200}); err != nil { t.Fatal(err) }
	b, err := os.ReadFile(filepath.Join(dir, "test.log"))
	if err != nil { t.Fatal(err) }
	if !strings.Contains(string(b), `"requestId":"r1"`) { t.Fatalf("unexpected log: %s", b) }
}

func TestDetailLoggerRespectsEnabled(t *testing.T) {
	dir := t.TempDir()
	d := NewDetailLogger(dir, false)
	d.LogRequest("r1", map[string]any{"a": 1})
	if _, err := os.Stat(filepath.Join(dir, "r1_request.log")); !os.IsNotExist(err) { t.Fatal("should not write when disabled") }
	d.SetEnabled(true)
	if !d.IsEnabled() { t.Fatal("expected enabled") }
	d.LogRequest("r1", map[string]any{"a": 1})
	d.LogResponse("r1", map[string]any{"b": 2})
	if _, err := os.Stat(filepath.Join(dir, "r1_request.log")); err != nil { t.Fatal(err) }
	if _, err := os.Stat(filepath.Join(dir, "r1_response.log")); err != nil { t.Fatal(err) }
}

func TestSystemLogger(t *testing.T) {
	dir := t.TempDir()
	s := NewSystemLogger(dir)
	s.Log("hello world")
	b, err := os.ReadFile(filepath.Join(dir, "system.log"))
	if err != nil { t.Fatal(err) }
	if !strings.Contains(string(b), "hello world") { t.Fatalf("got %s", b) }
}
