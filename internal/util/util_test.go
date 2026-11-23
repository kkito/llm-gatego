package util

import (
	"net/http/httptest"
	"testing"
	"time"
)

func TestFormatNumber(t *testing.T) {
	cases := []struct{ in *int64; want string }{
		{nil, "—"}, {i64(0), "0"}, {i64(999), "999"}, {i64(1000), "1K"},
		{i64(1500), "1.5K"}, {i64(1000000), "1M"}, {i64(2500000), "2.5M"},
	}
	for _, c := range cases {
		if got := FormatNumber(c.in); got != c.want { t.Errorf("FormatNumber(%v)=%q want %q", c.in, got, c.want) }
	}
}

func i64(v int64) *int64 { return &v }

func TestFormatDuration(t *testing.T) {
	if got := FormatDuration(nil); got != "—" { t.Fatal(got) }
	if got := FormatDuration(i(500)); got != "500ms" { t.Fatal(got) }
	if got := FormatDuration(i(1500)); got != "1.5s" { t.Fatal(got) }
}

func i(v int) *int { return &v }

func TestFormatPct(t *testing.T) {
	if got := FormatPct(1, 4); got != "25.0%" { t.Fatal(got) }
	if got := FormatPct(1, 0); got != "0%" { t.Fatal(got) }
}

func TestExtractClientIP(t *testing.T) {
	r := httptest.NewRequest("GET", "/", nil)
	r.Header.Set("X-Forwarded-For", "1.2.3.4, 5.6.7.8")
	if got := ExtractClientIP(r); got != "1.2.3.4" { t.Fatal(got) }
	r2 := httptest.NewRequest("GET", "/", nil)
	r2.Header.Set("X-Real-IP", "9.8.7.6")
	if got := ExtractClientIP(r2); got != "9.8.7.6" { t.Fatal(got) }
}

func TestSHA256Password(t *testing.T) {
	if got := SHA256Password("abc"); got != "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" { t.Fatal(got) }
}

func TestCalculateStreamMetrics(t *testing.T) {
	now := time.Now()
	ttft, tps := CalculateStreamMetrics(now, now.Add(100*time.Millisecond), now.Add(1*time.Second), 90)
	if ttft == nil || *ttft != 100 { t.Fatalf("ttft=%v", ttft) }
	if tps == nil || *tps < 99 || *tps > 101 { t.Fatalf("tps=%v", tps) }
}

func TestGetTodayDateFormat(t *testing.T) {
	if len(GetTodayDate()) != 10 || GetTodayDate()[4] != '-' { t.Fatal(GetTodayDate()) }
}
