package limiter

type Pricing struct {
	InputPricePer1M  float64
	OutputPricePer1M float64
	CachedPricePer1M float64
}

type TokenUsage struct {
	InputTokens  float64
	OutputTokens float64
	CachedTokens float64
}

func CalculateCost(u TokenUsage, p Pricing) float64 {
	return u.InputTokens/1_000_000*p.InputPricePer1M +
		u.OutputTokens/1_000_000*p.OutputPricePer1M +
		u.CachedTokens/1_000_000*p.CachedPricePer1M
}

func HasValidPricing(p *Pricing) bool {
	return p != nil && p.InputPricePer1M >= 0 && p.OutputPricePer1M >= 0 && p.CachedPricePer1M >= 0
}

func derefInt(p *int) int {
	if p == nil {
		return 0
	}
	return *p
}
