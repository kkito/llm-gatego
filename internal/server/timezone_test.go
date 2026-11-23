package server

import (
	"testing"
	"time"
)

func TestLocalDayRangeTZ_DST(t *testing.T) {
	loc, err := time.LoadLocation("America/New_York")
	if err != nil {
		t.Skip(err)
	}
	from, to, err := localDayRangeTZ("2026-03-08", "America/New_York")
	if err != nil {
		t.Fatal(err)
	}
	f, _ := time.Parse(time.RFC3339Nano, from)
	tt, _ := time.Parse(time.RFC3339Nano, to)
	if got := tt.Sub(f); got != 23*time.Hour {
		t.Fatalf("DST day should be 23h, got %s (%s..%s)", got, from, to)
	}
	_ = loc
}
