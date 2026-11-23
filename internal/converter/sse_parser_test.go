package converter

import (
	"strings"
	"testing"
)

func TestParseSSEStream(t *testing.T) {
	input := ": heartbeat\n\nevent: message\ndata: line1\ndata: line2\nid: 42\n\ndata: {\"x\":1}\n\n"
	var got []SSEEvent
	for ev := range ParseSSEStream(strings.NewReader(input)) { got = append(got, ev) }
	if len(got) != 2 { t.Fatalf("got %d events: %+v", len(got), got) }
	if got[0].Data != "line1\nline2" || got[0].ID != "42" { t.Fatalf("%+v", got[0]) }
	if got[1].Data != `{"x":1}` { t.Fatalf("%+v", got[1]) }
}
