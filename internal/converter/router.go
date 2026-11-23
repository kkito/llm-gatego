package converter

import "fmt"

var knownFormats = map[FormatName]bool{
	FormatChat: true, FormatOpenAI: true, FormatAnthropic: true,
	FormatResponses: true, FormatResponseAPI: true,
}

func ResolveConverterChain(source, provider FormatName) (ChainPlan, error) {
	if !knownFormats[source] {
		return ChainPlan{}, fmt.Errorf("unknown source format: %s", source)
	}
	if !knownFormats[provider] {
		return ChainPlan{}, fmt.Errorf("unknown provider format: %s", provider)
	}
	s, p := NormalizeFormat(source), NormalizeFormat(provider)
	return ChainPlan{
		Source: s, Provider: p,
		Passthrough: s == p,
		Steps: []string{string(s), "canonical", string(p)},
	}, nil
}
