package util

import (
	"strconv"
	"strings"
)

func FormatNumber(n *int64) string {
	if n == nil {
		return "—"
	}
	v := *n
	if v < 1000 {
		return strconv.FormatInt(v, 10)
	}
	if v < 1_000_000 {
		return trimZero(strconv.FormatFloat(float64(v)/1000, 'f', 1, 64)) + "K"
	}
	return trimZero(strconv.FormatFloat(float64(v)/1_000_000, 'f', 1, 64)) + "M"
}

func FormatDuration(ms *int) string {
	if ms == nil {
		return "—"
	}
	if *ms < 1000 {
		return strconv.Itoa(*ms) + "ms"
	}
	return trimZero(strconv.FormatFloat(float64(*ms)/1000, 'f', 1, 64)) + "s"
}

func FormatPct(value, total int) string {
	if total <= 0 {
		return "0%"
	}
	return strconv.FormatFloat(float64(value)/float64(total)*100, 'f', 1, 64) + "%"
}

func trimZero(s string) string {
	return strings.TrimSuffix(strings.TrimSuffix(s, "0"), ".")
}
