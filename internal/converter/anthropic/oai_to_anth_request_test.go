package anthropic

import "testing"

// Mirrors openai-to-anthropic-request.test.ts (19 cases).
func TestOAIToAnthRequest(t *testing.T) {
	req := func(messages []any, extra map[string]any) map[string]any {
		r := map[string]any{"model":"gpt-4","messages":messages,"max_tokens":float64(1024)}
		for k,v := range extra { r[k]=v }
		return r
	}
	checkText := func(t *testing.T, r map[string]any, msgIdx int, want string) {
		t.Helper()
		msg := r["messages"].([]any)[msgIdx].(map[string]any)
		blk := msg["content"].([]any)[0].(map[string]any)
		if blk["type"]!="text" || blk["text"]!=want { t.Fatalf("msg %d: %+v", msgIdx, msg) }
	}
	t.Run("string content to array", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{map[string]any{"role":"user","content":"你好，请介绍一下你自己"}},nil))
		if len(r["messages"].([]any))!=1 { t.Fatalf("%+v", r) }
		checkText(t,r,0,"你好，请介绍一下你自己")
	})
	t.Run("array text blocks", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{map[string]any{"role":"user","content":[]any{
			map[string]any{"type":"text","text":"Hello"},map[string]any{"type":"text","text":" World"}}}},nil))
		content := r["messages"].([]any)[0].(map[string]any)["content"].([]any)
		if len(content)!=2 || asMap(content[0])["text"]!="Hello" || asMap(content[1])["text"]!=" World" { t.Fatalf("%+v", content) }
	})
	t.Run("system message", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{
			map[string]any{"role":"system","content":"You are a helpful assistant."},
			map[string]any{"role":"user","content":"Hello"}},nil))
		if _,ok:=r["system"];ok { t.Fatalf("%+v", r) }
		msgs:=r["messages"].([]any); if len(msgs)!=1 { t.Fatalf("%+v",msgs) }
		content:=msgs[0].(map[string]any)["content"].([]any)
		if asMap(content[0])["text"]!="You are a helpful assistant.\n\n" || asMap(content[1])["text"]!="Hello" { t.Fatalf("%+v",content) }
	})
	t.Run("system array content", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{
			map[string]any{"role":"system","content":[]any{
				map[string]any{"type":"text","text":"You are helpful."},map[string]any{"type":"text","text":"Be concise."}}},
			map[string]any{"role":"user","content":"Hello"}},nil))
		content:=r["messages"].([]any)[0].(map[string]any)["content"].([]any)
		if asMap(content[0])["text"]!="You are helpful. Be concise.\n\n" || asMap(content[1])["text"]!="Hello" { t.Fatalf("%+v",content) }
	})
	t.Run("tool message to tool_result", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{
			map[string]any{"role":"assistant","content":nil,"tool_calls":[]any{map[string]any{"id":"call_123","type":"function","function":map[string]any{"name":"get_weather","arguments":`{"city": "Beijing"}`}}}},
			map[string]any{"role":"tool","content":"Sunny, 25°C","tool_call_id":"call_123"}},nil))
		msgs:=r["messages"].([]any); if len(msgs)!=2 { t.Fatalf("%+v",msgs) }
		blk:=asMap(msgs[1].(map[string]any)["content"].([]any)[0])
		if blk["type"]!="tool_result" || blk["tool_use_id"]!="call_123" || blk["content"]!="Sunny, 25°C" { t.Fatalf("%+v",blk) }
	})
	t.Run("tool message JSON content", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{map[string]any{"role":"tool","content":`{"status":"success","data":{"temp":25}}`,"tool_call_id":"call_123"}},nil))
		blk:=asMap(r["messages"].([]any)[0].(map[string]any)["content"].([]any)[0])
		if blk["content"]!=`{"status":"success","data":{"temp":25}}` { t.Fatalf("%+v",blk) }
	})
	t.Run("assistant string content omits content", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{map[string]any{"role":"assistant","content":"Let me check the weather."}},nil))
		msg:=r["messages"].([]any)[0].(map[string]any)
		if _,ok:=msg["content"];ok { t.Fatalf("%+v",msg) }
	})
	t.Run("assistant tool_calls", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{map[string]any{"role":"assistant","content":nil,"tool_calls":[]any{
			map[string]any{"id":"call_123","type":"function","function":map[string]any{"name":"get_weather","arguments":`{"city": "Beijing"}`}}}}},nil))
		blk:=asMap(r["messages"].([]any)[0].(map[string]any)["content"].([]any)[0])
		if blk["type"]!="tool_use" || blk["id"]!="call_123" || asMap(blk["input"])["city"]!="Beijing" { t.Fatalf("%+v",blk) }
	})
	t.Run("assistant text + tool_calls", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{map[string]any{"role":"assistant","content":"Let me check the weather.","tool_calls":[]any{
			map[string]any{"id":"call_123","type":"function","function":map[string]any{"name":"get_weather","arguments":`{"city": "Beijing"}`}}}}},nil))
		content:=r["messages"].([]any)[0].(map[string]any)["content"].([]any)
		if len(content)!=2 || asMap(content[0])["type"]!="text" || asMap(content[1])["type"]!="tool_use" { t.Fatalf("%+v",content) }
	})
	t.Run("assistant only text omitted", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{map[string]any{"role":"assistant","content":"Hello! How can I help you?"}},nil))
		if _,ok:=r["messages"].([]any)[0].(map[string]any)["content"];ok { t.Fatalf("%+v",r["messages"]) }
	})
	t.Run("assistant empty content", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{map[string]any{"role":"assistant","content":nil}},nil))
		if _,ok:=r["messages"].([]any)[0].(map[string]any)["content"];ok { t.Fatalf("%+v",r["messages"]) }
	})
	t.Run("tools definition", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{map[string]any{"role":"user","content":"Q"}},map[string]any{"tools":[]any{
			map[string]any{"type":"function","function":map[string]any{"name":"get_weather","description":"Get the weather for a city","parameters":map[string]any{"type":"object","properties":map[string]any{"city":map[string]any{"type":"string"}}}}}}}))
		tool:=asMap(r["tools"].([]any)[0])
		if tool["name"]!="get_weather" || tool["description"]!="Get the weather for a city" || asMap(tool["input_schema"])["type"]!="object" { t.Fatalf("%+v",tool) }
	})
	t.Run("stream and temperature", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{map[string]any{"role":"user","content":"Hello"}},map[string]any{"stream":true,"temperature":0.7}))
		if r["stream"]!=true || r["temperature"]!=0.7 { t.Fatalf("%+v",r) }
	})
	t.Run("complete conversation", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{
			map[string]any{"role":"system","content":"You are a helpful assistant."},
			map[string]any{"role":"user","content":"What is the weather in Beijing?"},
			map[string]any{"role":"assistant","content":"Let me check that for you.","tool_calls":[]any{map[string]any{"id":"call_123","function":map[string]any{"name":"get_weather","arguments":`{"city": "Beijing"}`}}}},
			map[string]any{"role":"tool","content":"Sunny, 25°C","tool_call_id":"call_123"}},nil))
		msgs:=r["messages"].([]any); if len(msgs)!=3 { t.Fatalf("%+v",msgs) }
		if asMap(msgs[0].(map[string]any)["content"].([]any)[0])["text"]!="You are a helpful assistant.\n\n" { t.Fatalf("%+v",msgs[0]) }
		if len(msgs[1].(map[string]any)["content"].([]any))!=2 { t.Fatalf("%+v",msgs[1]) }
		if asMap(msgs[2].(map[string]any)["content"].([]any)[0])["type"]!="tool_result" { t.Fatalf("%+v",msgs[2]) }
	})
	t.Run("null content", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{map[string]any{"role":"user","content":nil}},nil))
		blk:=asMap(r["messages"].([]any)[0].(map[string]any)["content"].([]any)[0])
		if blk["type"]!="text" || blk["text"]!="" { t.Fatalf("%+v",blk) }
	})
	t.Run("multi-turn with assistant text", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{
			map[string]any{"role":"user","content":"hello"},
			map[string]any{"role":"assistant","content":"Hello! How can I help you?"},
			map[string]any{"role":"user","content":"What is the weather?"}},nil))
		msgs:=r["messages"].([]any); if len(msgs)!=3 { t.Fatalf("%+v",msgs) }
		if _,ok:=msgs[1].(map[string]any)["content"];ok { t.Fatalf("%+v",msgs[1]) }
		checkText(t,r,0,"hello"); checkText(t,r,2,"What is the weather?")
	})
	t.Run("merge system into first user", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{
			map[string]any{"role":"system","content":"You are a helpful assistant."},
			map[string]any{"role":"user","content":[]any{map[string]any{"type":"text","text":"Hello"}}}},nil))
		content:=r["messages"].([]any)[0].(map[string]any)["content"].([]any)
		if asMap(content[0])["text"]!="You are a helpful assistant.\n\n" || asMap(content[1])["text"]!="Hello" { t.Fatalf("%+v",content) }
	})
	t.Run("assistant without content", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{
			map[string]any{"role":"user","content":[]any{map[string]any{"type":"text","text":"context"}}},
			map[string]any{"role":"assistant","content":""},
			map[string]any{"role":"user","content":[]any{map[string]any{"type":"text","text":"hello"}}}},nil))
		if _,ok:=r["messages"].([]any)[1].(map[string]any)["content"];ok { t.Fatalf("%+v",r["messages"]) }
	})
	t.Run("multi-turn system and empty assistant", func(t *testing.T) {
		r:=ChatToAnthropicRequest(req([]any{
			map[string]any{"role":"system","content":"You are helpful."},
			map[string]any{"role":"user","content":[]any{map[string]any{"type":"text","text":"part1"},map[string]any{"type":"text","text":"part2"}}},
			map[string]any{"role":"assistant","content":nil},
			map[string]any{"role":"user","content":[]any{map[string]any{"type":"text","text":"part3"},map[string]any{"type":"text","text":"part4"}}}},nil))
		msgs:=r["messages"].([]any); if len(msgs)!=3 { t.Fatalf("%+v",msgs) }
		if _,ok:=msgs[1].(map[string]any)["content"];ok { t.Fatalf("%+v",msgs[1]) }
		if len(asMap(msgs[0].(map[string]any)["content"].([]any)[0]))==0 { t.Fatalf("%+v",msgs[0]) }
	})
}
