package converter

import (
	"bufio"
	"io"
	"strings"
)

type SSEEvent struct {
	Event string
	Data  string
	ID    string
}

// ParseSSEStream parses an SSE stream frame by frame (multi-line data, comments, heartbeats).
func ParseSSEStream(r io.Reader) <-chan SSEEvent {
	ch := make(chan SSEEvent)
	go func() {
		defer close(ch)
		scanner := bufio.NewScanner(r)
		scanner.Buffer(make([]byte, 0, 64*1024), 10*1024*1024)
		var event, id string
		var dataLines []string
		flush := func() bool {
			if len(dataLines) == 0 && event == "" {
				return false
			}
			ch <- SSEEvent{Event: event, Data: strings.Join(dataLines, "\n"), ID: id}
			event, id = "", ""
			dataLines = nil
			return true
		}
		for scanner.Scan() {
			line := strings.TrimSuffix(scanner.Text(), "\r")
			if line == "" {
				flush()
				continue
			}
			if strings.HasPrefix(line, ":") {
				continue // comment / heartbeat
			}
			if strings.HasPrefix(line, "event:") {
				event = strings.TrimSpace(strings.TrimPrefix(line, "event:"))
			} else if strings.HasPrefix(line, "id:") {
				id = strings.TrimSpace(strings.TrimPrefix(line, "id:"))
			} else if strings.HasPrefix(line, "data:") {
				dataLines = append(dataLines, strings.TrimPrefix(strings.TrimPrefix(line, "data:"), " "))
			}
		}
		flush()
	}()
	return ch
}
