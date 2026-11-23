package anthropic

import (
	"encoding/json"
	"testing"
)

func anthReq(messages []any, extra map[string]any) map[string]any {
	r := map[string]any{"model": "claude-3-5-sonnet-20241022", "messages": messages, "max_tokens": float64(1024)}
	for k, v := range extra { r[k] = v }
	return r
}

// Mirrors anthropic-to-openai-request.test.ts (24 cases).
func TestAnthToOAIRequest(t *testing.T) {
	t.Run("simple text request", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"user","content":"Hello, Claude!"}}, nil))
		if r["model"] != "claude-3-5-sonnet-20241022" || r["max_tokens"] != float64(1024) { t.Fatalf("%+v", r) }
		msg := r["messages"].([]any)[0].(map[string]any)
		if msg["role"]!="user" || msg["content"]!="Hello, Claude!" { t.Fatalf("%+v", msg) }
	})
	t.Run("system field", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"user","content":"What is 2+2?"}}, map[string]any{"system":"You are a helpful assistant."}))
		msgs := r["messages"].([]any)
		if len(msgs)!=2 || msgs[0].(map[string]any)["content"]!="You are a helpful assistant." { t.Fatalf("%+v", msgs) }
	})
	t.Run("system array with cache_control", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"user","content":"Q"}}, map[string]any{"system":[]any{
			map[string]any{"type":"text","text":"You are helpful.","cache_control":map[string]any{"type":"ephemeral"}},
			map[string]any{"type":"text","text":"Answer concisely."}}}))
		if r["messages"].([]any)[0].(map[string]any)["content"]!="You are helpful. Answer concisely." { t.Fatalf("%+v", r["messages"]) }
	})
	t.Run("tools definition", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{}, map[string]any{"tools":[]any{map[string]any{
			"name":"get_weather","description":"Get the weather for a city",
			"input_schema":map[string]any{"type":"object","properties":map[string]any{"city":map[string]any{"type":"string"}}}}}}))
		tool := r["tools"].([]any)[0].(map[string]any)
		if tool["type"]!="function" || asMap(tool["function"])["name"]!="get_weather" { t.Fatalf("%+v", tool) }
	})
	t.Run("stream parameter", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{}, map[string]any{"stream":true}))
		if r["stream"]!=true { t.Fatalf("%+v", r) }
	})
	t.Run("assistant tool_use", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"assistant","content":[]any{
			map[string]any{"type":"text","text":"Let me check the weather."},
			map[string]any{"type":"tool_use","id":"toolu_123","name":"get_weather","input":map[string]any{"city":"Beijing"}}}}}, nil))
		msg := r["messages"].([]any)[0].(map[string]any)
		if msg["content"]!="Let me check the weather." { t.Fatalf("%+v", msg) }
		call := msg["tool_calls"].([]any)[0].(map[string]any)
		if asMap(call["function"])["arguments"]!=`{"city":"Beijing"}` { t.Fatalf("%+v", call) }
	})
	t.Run("only tool_calls sets content nil", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"assistant","content":[]any{
			map[string]any{"type":"tool_use","id":"t","name":"f","input":map[string]any{}}}}}, nil))
		msg := r["messages"].([]any)[0].(map[string]any)
		if msg["content"]!=nil || len(msg["tool_calls"].([]any))!=1 { t.Fatalf("%+v", msg) }
	})
	t.Run("user tool_result", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"user","content":[]any{
			map[string]any{"type":"tool_result","tool_use_id":"toolu_123","content":"The weather is sunny."}}}}, nil))
		msg := r["messages"].([]any)[0].(map[string]any)
		if msg["role"]!="tool" || msg["content"]!="The weather is sunny." || msg["tool_call_id"]!="toolu_123" { t.Fatalf("%+v", msg) }
	})
	t.Run("group tool_results by id", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"user","content":[]any{
			map[string]any{"type":"tool_result","tool_use_id":"t1","content":"Result A"},
			map[string]any{"type":"tool_result","tool_use_id":"t1","content":"Result B"},
			map[string]any{"type":"tool_result","tool_use_id":"t2","content":"Result C"}}}}, nil))
		msgs := r["messages"].([]any)
		if len(msgs)!=2 || msgs[0].(map[string]any)["content"]!="Result A\nResult B" || msgs[1].(map[string]any)["content"]!="Result C" { t.Fatalf("%+v", msgs) }
	})
	t.Run("tool_result JSON content", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"user","content":[]any{
			map[string]any{"type":"tool_result","tool_use_id":"t","content":map[string]any{"status":"success","data":map[string]any{"temp":float64(25)}}}}}}, nil))
		msg := r["messages"].([]any)[0].(map[string]any)
		if msg["content"]!=`{"data":{"temp":25},"status":"success"}` { t.Fatalf("%+v", msg) }
	})
	t.Run("empty tool_result content", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"user","content":[]any{
			map[string]any{"type":"tool_result","tool_use_id":"t","content":""}}}}, nil))
		if r["messages"].([]any)[0].(map[string]any)["content"]!="No output" { t.Fatalf("%+v", r["messages"]) }
	})
	t.Run("tool_result and text separated", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"user","content":[]any{
			map[string]any{"type":"text","text":"Here is the result:"},
			map[string]any{"type":"tool_result","tool_use_id":"t","content":"Sunny"}}}}, nil))
		msgs := r["messages"].([]any)
		if len(msgs)!=2 || msgs[0].(map[string]any)["role"]!="tool" || msgs[1].(map[string]any)["content"]!="Here is the result:" { t.Fatalf("%+v", msgs) }
	})
	t.Run("user text content blocks", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"user","content":[]any{
			map[string]any{"type":"text","text":"Hello"}, map[string]any{"type":"text","text":" World"}}}}, nil))
		if r["messages"].([]any)[0].(map[string]any)["content"]!="Hello World" { t.Fatalf("%+v", r["messages"]) }
	})
	t.Run("multiple tool_use", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"assistant","content":[]any{
			map[string]any{"type":"tool_use","id":"t1","name":"tool1","input":map[string]any{"a":float64(1)}},
			map[string]any{"type":"tool_use","id":"t2","name":"tool2","input":map[string]any{"b":float64(2)}}}}}, nil))
		calls := r["messages"].([]any)[0].(map[string]any)["tool_calls"].([]any)
		if len(calls)!=2 || asMap(calls[0].(map[string]any)["function"])["arguments"]!=`{"a":1}` || asMap(calls[1].(map[string]any)["function"])["arguments"]!=`{"b":2}` { t.Fatalf("%+v", calls) }
	})
	t.Run("empty tool_use input", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"assistant","content":[]any{
			map[string]any{"type":"tool_use","id":"t","name":"simple_tool"}}}}, nil))
		call := r["messages"].([]any)[0].(map[string]any)["tool_calls"].([]any)[0].(map[string]any)
		if asMap(call["function"])["arguments"]!="{}" { t.Fatalf("%+v", call) }
	})
	t.Run("temperature parameter", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{}, map[string]any{"temperature":0.7}))
		if r["temperature"]!=0.7 { t.Fatalf("%+v", r) }
	})
	t.Run("complete conversation flow", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{
			map[string]any{"role":"user","content":"What is the weather in Beijing?"},
			map[string]any{"role":"assistant","content":[]any{map[string]any{"type":"tool_use","id":"t","name":"get_weather","input":map[string]any{"city":"Beijing"}}}},
			map[string]any{"role":"user","content":[]any{map[string]any{"type":"tool_result","tool_use_id":"t","content":"Sunny, 25°C"}}},
		}, map[string]any{"system":"You are a helpful assistant."}))
		msgs := r["messages"].([]any)
		if len(msgs)!=4 { t.Fatalf("%+v", msgs) }
		if msgs[0].(map[string]any)["role"]!="system" || msgs[2].(map[string]any)["content"]!=nil || msgs[3].(map[string]any)["role"]!="tool" { t.Fatalf("%+v", msgs) }
	})
	// thinking parameter conversion (8 cases)
	t.Run("thinking enabled to stream_options", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{map[string]any{"role":"user","content":"Think"}}, map[string]any{"stream":true,"thinking":map[string]any{"type":"enabled","budget_tokens":float64(1024)}}))
		so := asMap(r["stream_options"]); if so["include_reasoning"]!=true { t.Fatalf("%+v", r) }
	})
	t.Run("thinking disabled no stream_options", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{}, map[string]any{"stream":true,"thinking":map[string]any{"type":"disabled"}}))
		if _, ok := r["stream_options"]; ok { t.Fatalf("%+v", r) }
	})
	t.Run("no thinking no stream_options", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{}, map[string]any{"stream":true}))
		if _, ok := r["stream_options"]; ok { t.Fatalf("%+v", r) }
	})
	t.Run("thinking with budget_tokens", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{}, map[string]any{"stream":true,"thinking":map[string]any{"type":"enabled","budget_tokens":float64(4096)}}))
		if asMap(r["stream_options"])["include_reasoning"]!=true { t.Fatalf("%+v", r) }
		if _, ok := r["thinking"]; ok { t.Fatal("thinking should not be passed through") }
	})
	t.Run("thinking blocks extracted into reasoning", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{
			map[string]any{"role":"user","content":"Q"},
			map[string]any{"role":"assistant","content":[]any{
				map[string]any{"type":"thinking","text":"","thinking":"Let me calculate 2+2. That equals 4.","signature":"abc"},
				map[string]any{"type":"text","text":"The answer is 4."}}}}, map[string]any{"thinking":map[string]any{"type":"enabled"}}))
		msg := r["messages"].([]any)[1].(map[string]any)
		if msg["content"]!="The answer is 4." || msg["reasoning_content"]!="Let me calculate 2+2. That equals 4." { t.Fatalf("%+v", msg) }
	})
	t.Run("thinking and tool_calls", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{
			map[string]any{"role":"user","content":"Q"},
			map[string]any{"role":"assistant","content":[]any{
				map[string]any{"type":"thinking","thinking":"I should use the weather tool."},
				map[string]any{"type":"tool_use","id":"t","name":"get_weather","input":map[string]any{}}}}}, map[string]any{"thinking":map[string]any{"type":"enabled"}}))
		msg := r["messages"].([]any)[1].(map[string]any)
		if msg["content"]!=nil || msg["reasoning_content"]!="I should use the weather tool." || len(msg["tool_calls"].([]any))!=1 { t.Fatalf("%+v", msg) }
	})
	t.Run("multiple thinking blocks", func(t *testing.T) {
		r := AnthropicToChatRequest(anthReq([]any{
			map[string]any{"role":"user","content":"Hello"},
			map[string]any{"role":"assistant","content":[]any{
				map[string]any{"type":"thinking","thinking":"First thought. "},
				map[string]any{"type":"text","text":"Hi!"},
				map[string]any{"type":"thinking","thinking":"Second thought."}}}}, nil))
		msg := r["messages"].([]any)[1].(map[string]any)
		if msg["reasoning_content"]!="First thought. Second thought." { t.Fatalf("%+v", msg) }
	})
	_ = json.Valid
}
