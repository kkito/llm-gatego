package limiter

import (
	"math"
	"testing"
)

// Mirrors tests/lib/cost-calculator.test.ts (10 cases).
func TestCalculateCostAndValidity(t *testing.T) {
	p := Pricing{10, 30, 0}
	cases := []struct {
		name string
		u    TokenUsage
		want float64
	}{
		{"input only", TokenUsage{1_000_000, 0, 0}, 10},
		{"output only", TokenUsage{0, 1_000_000, 0}, 30},
		{"mixed", TokenUsage{500_000, 200_000, 100_000}, 11},
		{"cached discount", TokenUsage{0, 0, 1_000_000}, 0},
		{"zero", TokenUsage{}, 0},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := CalculateCost(c.u, p); math.Abs(got-c.want) > 1e-9 {
				t.Fatalf("got %v want %v", got, c.want)
			}
		})
	}
	t.Run("cached pricing", func(t *testing.T) {
		if got := CalculateCost(TokenUsage{0, 0, 1_000_000}, Pricing{10, 30, 2.5}); got != 2.5 {
			t.Fatal(got)
		}
	})
	t.Run("small amounts", func(t *testing.T) {
		if got := CalculateCost(TokenUsage{100, 50, 0}, p); math.Abs(got-0.0025) > 1e-9 {
			t.Fatal(got)
		}
	})
	t.Run("valid pricing", func(t *testing.T) {
		if !HasValidPricing(&p) {
			t.Fatal("expected valid")
		}
	})
	t.Run("nil pricing", func(t *testing.T) {
		if HasValidPricing(nil) {
			t.Fatal("expected invalid")
		}
	})
	// TS missing-field/non-number cases collapse to nil pricing in Go's typed model.
	// TS "missing fields"/"non-number" cases map to nil pricing in the typed Go model.
	t.Run("zero pricing is valid", func(t *testing.T) {
		if !HasValidPricing(&Pricing{}) {
			t.Fatal("zero pricing should be valid")
		}
	})
}
