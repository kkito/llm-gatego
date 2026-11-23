package util

import "time"

func CalculateStreamMetrics(requestStart, firstTokenAt, lastTokenAt time.Time, completionTokens int) (*int, *float64) {
	if firstTokenAt.IsZero() {
		return nil, nil
	}
	ttftMs := int(firstTokenAt.Sub(requestStart).Milliseconds())
	if ttftMs < 0 { ttftMs = 0 }
	duration := lastTokenAt.Sub(firstTokenAt).Seconds()
	if duration <= 0 || completionTokens <= 0 {
		return &ttftMs, nil
	}
	tps := float64(completionTokens) / duration
	return &ttftMs, &tps
}
