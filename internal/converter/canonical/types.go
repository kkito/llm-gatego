package canonical

type Role string

const (
	RoleUser      Role = "user"
	RoleAssistant Role = "assistant"
	RoleSystem    Role = "system"
	RoleTool      Role = "tool"
)

type ContentPart struct {
	Type     string         `json:"type"`
	Text     string         `json:"text,omitempty"`
	ImageURL map[string]any `json:"image_url,omitempty"`
	Source   map[string]any `json:"source,omitempty"`
	ID       string         `json:"id,omitempty"`
	Name     string         `json:"name,omitempty"`
	Input    any            `json:"input,omitempty"`
}

type Message struct {
	Role       Role           `json:"role"`
	Content    any            `json:"content,omitempty"`
	ToolCalls  []ToolCall     `json:"tool_calls,omitempty"`
	ToolUseID  string         `json:"tool_use_id,omitempty"`
	Thinking   string         `json:"thinking,omitempty"`
	Signature  string         `json:"signature,omitempty"`
	Extra      map[string]any `json:"-"`
}

type ToolCall struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Function struct {
		Name      string `json:"name"`
		Arguments string `json:"arguments"`
	} `json:"function"`
}

type Tool struct {
	Type     string         `json:"type"`
	Function map[string]any `json:"function,omitempty"`
	Name     string         `json:"name,omitempty"`
	Input    map[string]any `json:"input_schema,omitempty"`
}

type ChatRequest struct {
	Model       string         `json:"model"`
	Messages    []Message      `json:"messages"`
	Tools       []Tool         `json:"tools,omitempty"`
	Stream      bool           `json:"stream,omitempty"`
	Temperature *float64       `json:"temperature,omitempty"`
	MaxTokens   *int           `json:"max_tokens,omitempty"`
	TopP        *float64       `json:"top_p,omitempty"`
	Extra       map[string]any `json:"-"`
}

type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
	CachedTokens     int `json:"cached_tokens,omitempty"`
}

type ChatResponse struct {
	ID      string   `json:"id"`
	Model   string   `json:"model"`
	Content string   `json:"content"`
	ToolCalls []ToolCall `json:"tool_calls,omitempty"`
	FinishReason string `json:"finish_reason,omitempty"`
	Usage   *Usage   `json:"usage,omitempty"`
	Thinking string  `json:"thinking,omitempty"`
	Extra   map[string]any `json:"-"`
}

type ChatStreamChunk struct {
	ID           string     `json:"id,omitempty"`
	Model        string     `json:"model,omitempty"`
	DeltaContent string     `json:"deltaContent,omitempty"`
	DeltaThinking string    `json:"deltaThinking,omitempty"`
	ToolCallDelta *ToolCall `json:"toolCallDelta,omitempty"`
	FinishReason string     `json:"finishReason,omitempty"`
	Usage        *Usage     `json:"usage,omitempty"`
	Raw          any        `json:"-"`
}
