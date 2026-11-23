package shared

func MapAnthropicToOpenAIFinishReason(reason string) string {
	switch reason {
	case "":
		return ""
	case "end_turn", "stop_sequence":
		return "stop"
	case "tool_use":
		return "tool_calls"
	case "max_tokens":
		return "length"
	default:
		return "stop"
	}
}

func MapOpenAIToAnthropicFinishReason(reason string) string {
	switch reason {
	case "":
		return ""
	case "stop":
		return "end_turn"
	case "length":
		return "max_tokens"
	case "tool_calls":
		return "tool_use"
	case "content_filter":
		return "stop_sequence"
	default:
		return "end_turn"
	}
}
