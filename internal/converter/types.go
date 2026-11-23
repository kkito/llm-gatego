package converter

import (
	"github.com/kkito/llm-gatego/internal/converter/canonical"
)

type FormatName string

const (
	FormatChat       FormatName = "chat"
	FormatOpenAI     FormatName = "openai"
	FormatAnthropic  FormatName = "anthropic"
	FormatResponses  FormatName = "responses"
	FormatResponseAPI FormatName = "response-api"
)

func NormalizeFormat(f FormatName) FormatName {
	switch f {
	case FormatOpenAI:
		return FormatChat
	case FormatResponseAPI:
		return FormatResponses
	default:
		return f
	}
}

type StreamConverter interface {
	Transform(chunk any) []any
	Flush() []any
}

type FormatAdapter interface {
	Name() FormatName
	ToChatRequest(any) (canonical.ChatRequest, error)
	FromChatRequest(canonical.ChatRequest) (any, error)
	ToChatResponse(any) (canonical.ChatResponse, error)
	FromChatResponse(canonical.ChatResponse) (any, error)
	CreateUpstreamStream() StreamConverter
	CreateDownstreamStream() StreamConverter
}

type ChainPlan struct {
	Source      FormatName
	Provider    FormatName
	Passthrough bool
	Steps       []string
}
