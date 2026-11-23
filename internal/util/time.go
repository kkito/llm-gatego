package util

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

func GetTodayDate() string { return time.Now().Format("2006-01-02") }

func GetWeekStart() string {
	now := time.Now()
	day := int(now.Weekday())
	if day == 0 { day = 7 }
	return now.AddDate(0, 0, -day+1).Format("2006-01-02")
}

func GetMonthStart() string { return time.Now().Format("2006-01") + "-01" }

// LocalDateToUTCRange converts a local date/week/month to UTC millisecond range.
func LocalDateToUTCRange(date, week, month string) (int64, int64, error) {
	var start, end time.Time
	loc := time.Local
	switch {
	case date != "":
		t, err := time.ParseInLocation("2006-01-02", date, loc)
		if err != nil { return 0, 0, err }
		start, end = t, t.AddDate(0, 0, 1)
	case month != "":
		t, err := time.ParseInLocation("2006-01", month, loc)
		if err != nil { return 0, 0, err }
		start, end = t, t.AddDate(0, 1, 0)
	case week != "":
		start, end = parseISOWeek(week)
		if end.IsZero() { return 0, 0, fmt.Errorf("invalid week format: %s", week) }
	default:
		return 0, 0, fmt.Errorf("one of date/week/month is required")
	}
	return start.UTC().UnixMilli(), end.UTC().UnixMilli(), nil
}

func parseISOWeek(s string) (time.Time, time.Time) {
	parts := strings.Split(s, "-W")
	if len(parts) != 2 { return time.Time{}, time.Time{} }
	year, err1 := strconv.Atoi(parts[0])
	week, err2 := strconv.Atoi(parts[1])
	if err1 != nil || err2 != nil || week < 1 || week > 53 { return time.Time{}, time.Time{} }
	jan4 := time.Date(year, 1, 4, 0, 0, 0, 0, time.UTC)
	start := jan4.AddDate(0, 0, -int(jan4.Weekday())+1+(week-1)*7)
	return start, start.AddDate(0, 0, 7)
}
