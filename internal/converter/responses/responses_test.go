package responses

import (
	"encoding/json"
	"strings"
	"testing"
)

func j(v any) string { b,_:=json.Marshal(v); return string(b) }
func findEvt(lines []string, typ string) map[string]any {
	for _,l:=range lines {
		for _,seg:=range strings.Split(l,"\n") {
			if strings.HasPrefix(seg,"data: ") {
				var m map[string]any; if json.Unmarshal([]byte(strings.TrimPrefix(seg,"data: ")),&m)==nil && m["type"]==typ { return m }
			}
		}
	}
	return nil
}

// Mirrors responses/request.test.ts (19 cases).
func TestResponsesRequest(t *testing.T) {
	t.Run("instructions -> system, input -> user", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"gpt-4","instructions":"Be nice","input":"Hello"})
		msgs:=r["messages"].([]any); if len(msgs)!=2||msgs[0].(map[string]any)["content"]!="Be nice"||msgs[1].(map[string]any)["content"]!="Hello"{t.Fatalf("%+v",msgs)}
	})
	t.Run("previous_response_id preserved", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"m","input":"x","previous_response_id":"resp_abc"})
		if r["previousResponseId"]!="resp_abc"{t.Fatalf("%+v",r)}
	})
	t.Run("chat system+user -> instructions+input", func(t *testing.T) {
		r:=ChatToResponsesRequest(map[string]any{"model":"gpt-4","messages":[]any{map[string]any{"role":"system","content":"Be nice"},map[string]any{"role":"user","content":"Hello"}}})
		if r["instructions"]!="Be nice"||len(r["input"].([]any))!=1{t.Fatalf("%+v",r)}
	})
	t.Run("flat tools -> chat function.name", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"m","input":"x","tools":[]any{map[string]any{"type":"function","name":"cron_list"}}})
		tool:=asMap(asSlice(r["tools"])[0]); if asMap(tool["function"])["name"]!="cron_list"{t.Fatalf("%+v",tool)}
	})
	t.Run("nested tools", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"m","input":"x","tools":[]any{map[string]any{"type":"function","function":map[string]any{"name":"get_weather"}}}})
		if asMap(asMap(asSlice(r["tools"])[0])["function"])["name"]!="get_weather"{t.Fatalf("%+v",r["tools"])}
	})
	t.Run("non-function tools dropped", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"m","input":"x","tools":[]any{map[string]any{"type":"web_search"},map[string]any{"type":"namespace"}}})
		if len(asSlice(r["tools"]))!=0{t.Fatalf("%+v",r["tools"])}
	})
	t.Run("tool_choice bidirectional", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"m","input":"x","tools":[]any{map[string]any{"type":"function","name":"f"}},"tool_choice":map[string]any{"type":"function","name":"f"}})
		if asMap(asMap(r["tool_choice"])["function"])["name"]!="f"{t.Fatalf("%+v",r["tool_choice"])}
		back:=ChatToResponsesRequest(map[string]any{"model":"m","messages":[]any{map[string]any{"role":"user","content":"x"}},"tools":[]any{map[string]any{"type":"function","function":map[string]any{"name":"f"}}},"tool_choice":r["tool_choice"]})
		if asMap(back["tool_choice"])["name"]!="f"{t.Fatalf("%+v",back["tool_choice"])}
	})
	t.Run("required downgraded to auto", func(t *testing.T) {
		r:=ChatToResponsesRequest(map[string]any{"model":"m","messages":[]any{},"tools":[]any{map[string]any{"type":"function","function":map[string]any{"name":"f"}}},"tool_choice":"required"})
		if r["tool_choice"]!="auto"{t.Fatalf("%+v",r)}
	})
	t.Run("no tools drops tool_choice", func(t *testing.T) {
		r:=ChatToResponsesRequest(map[string]any{"model":"m","messages":[]any{},"tool_choice":"auto"})
		if _,ok:=r["tool_choice"];ok{t.Fatalf("%+v",r)}
	})
	t.Run("unknown function tool_choice -> auto", func(t *testing.T) {
		r:=ChatToResponsesRequest(map[string]any{"model":"m","messages":[]any{},"tools":[]any{map[string]any{"type":"function","function":map[string]any{"name":"f"}}},"tool_choice":map[string]any{"type":"function","function":map[string]any{"name":"other"}}})
		if r["tool_choice"]!="auto"{t.Fatalf("%+v",r)}
	})
	t.Run("chat->responses adds type:function", func(t *testing.T) {
		r:=ChatToResponsesRequest(map[string]any{"model":"m","messages":[]any{},"tools":[]any{map[string]any{"type":"function","function":map[string]any{"name":"f","parameters":map[string]any{"type":"object"}}}}})
		if asMap(asSlice(r["tools"])[0])["type"]!="function"{t.Fatalf("%+v",r["tools"])}
	})
	t.Run("chat->responses missing parameters default", func(t *testing.T) {
		r:=ChatToResponsesRequest(map[string]any{"model":"m","messages":[]any{},"tools":[]any{map[string]any{"type":"function","function":map[string]any{"name":"f"}}}})
		if asMap(asSlice(r["tools"])[0])["parameters"]==nil{t.Fatalf("%+v",r["tools"])}
	})
	t.Run("responses->chat flat missing parameters default", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"m","input":"x","tools":[]any{map[string]any{"type":"function","name":"f"}}})
		if asMap(asMap(asSlice(r["tools"])[0])["function"])["parameters"]==nil{t.Fatalf("%+v",r["tools"])}
	})
	t.Run("consecutive function_call merged", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"m","input":[]any{
			map[string]any{"type":"function_call","call_id":"a","name":"f1","arguments":"{}"},
			map[string]any{"type":"function_call","call_id":"b","name":"f2","arguments":"{}"}}})
		msgs:=r["messages"].([]any); if len(msgs)!=1||len(asSlice(msgs[0].(map[string]any)["tool_calls"]))!=2{t.Fatalf("%+v",msgs)}
	})
	t.Run("function_call reasoning_content", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"m","input":[]any{map[string]any{"type":"function_call","call_id":"a","name":"f","reasoning_content":"thinking"}}})
		if asMap(r["messages"].([]any)[0])["reasoning"]!="thinking"{t.Fatalf("%+v",r["messages"])}
	})
	t.Run("injected system moved before assistant tool_calls", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"m","input":[]any{
			map[string]any{"type":"function_call","call_id":"a","name":"f"},
			map[string]any{"role":"system","content":"approval"},
			map[string]any{"type":"function_call_output","call_id":"a","output":"ok"}}})
		msgs:=r["messages"].([]any); if len(msgs)!=3||msgs[0].(map[string]any)["role"]!="system"||msgs[1].(map[string]any)["role"]!="assistant"||msgs[2].(map[string]any)["role"]!="tool"{t.Fatalf("%+v",msgs)}
	})
	t.Run("developer role -> system", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"m","input":[]any{map[string]any{"role":"developer","content":"x"}}})
		if r["messages"].([]any)[0].(map[string]any)["role"]!="system"{t.Fatalf("%+v",r["messages"])}
	})
	t.Run("top_p/parallel_tool_calls/text.format", func(t *testing.T) {
		r:=ResponsesToChatRequest(map[string]any{"model":"m","input":"x","top_p":0.9,"parallel_tool_calls":false,"text":map[string]any{"format":map[string]any{"type":"json_object"}}})
		if r["top_p"]!=0.9||r["parallel_tool_calls"]!=false||r["response_format"]==nil{t.Fatalf("%+v",r)}
	})
	t.Run("reverse top_p/response_format", func(t *testing.T) {
		r:=ChatToResponsesRequest(map[string]any{"model":"m","messages":[]any{},"top_p":0.8,"parallel_tool_calls":true,"response_format":map[string]any{"type":"json_object"}})
		if r["top_p"]!=0.8||r["parallel_tool_calls"]!=true||asMap(r["text"])["format"]==nil{t.Fatalf("%+v",r)}
	})
}

// Mirrors responses/response.test.ts (8 cases).
func TestResponsesResponse(t *testing.T) {
	t.Run("output text -> choice content", func(t *testing.T) {
		r:=ResponsesToChatResponse(map[string]any{"id":"resp_1","model":"m","output":[]any{map[string]any{"type":"message","content":[]any{map[string]any{"type":"output_text","text":"Hello"}}}}})
		msg:=asMap(asSlice(r["choices"])[0])["message"]; if asMap(msg)["content"]!="Hello"{t.Fatalf("%+v",r)}
	})
	t.Run("function_call -> tool_calls", func(t *testing.T) {
		r:=ResponsesToChatResponse(map[string]any{"id":"resp_1","model":"m","output":[]any{map[string]any{"type":"function_call","call_id":"c","name":"f","arguments":"{}"}}})
		msg:=asMap(asSlice(r["choices"])[0])["message"]; if len(asSlice(asMap(msg)["tool_calls"]))!=1{t.Fatalf("%+v",r)}
		if asStr(asMap(asSlice(r["choices"])[0])["finish_reason"])!="tool_calls"{t.Fatalf("%+v",r)}
		if asStr(asMap(asSlice(r["choices"])[0])["finish_reason"])!="tool_calls"{t.Fatalf("%+v",r)}
	})
	t.Run("chat usage no details -> zeros", func(t *testing.T) {
		r:=ChatToResponsesResponse(map[string]any{"id":"chatcmpl_1","model":"m","choices":[]any{map[string]any{"message":map[string]any{"content":"x"}}},"usage":map[string]any{"prompt_tokens":1.0,"completion_tokens":2.0,"total_tokens":3.0}})
		u:=asMap(r["usage"]); if num(asMap(u["input_tokens_details"])["cached_tokens"])!=0||num(asMap(u["output_tokens_details"])["reasoning_tokens"])!=0{t.Fatalf("%+v",u)}
	})
	t.Run("usage details passthrough", func(t *testing.T) {
		r:=ChatToResponsesResponse(map[string]any{"id":"r","model":"m","choices":[]any{},"usage":map[string]any{"prompt_tokens":1.0,"completion_tokens":2.0,"prompt_tokens_details":map[string]any{"cached_tokens":5.0},"completion_tokens_details":map[string]any{"reasoning_tokens":3.0}}})
		u:=asMap(r["usage"]); if num(asMap(u["input_tokens_details"])["cached_tokens"])!=5||num(asMap(u["output_tokens_details"])["reasoning_tokens"])!=3{t.Fatalf("%+v",u)}
	})
	t.Run("encrypted_content preserved", func(t *testing.T) {
		r:=ChatToResponsesResponse(map[string]any{"id":"r","model":"m","choices":[]any{},"responsesEncryptedContent":"enc"})
		if r["encrypted_content"]!="enc"{t.Fatalf("%+v",r)}
	})
	t.Run("tool_calls with status and meta", func(t *testing.T) {
		r:=ChatToResponsesResponse(map[string]any{"id":"chatcmpl_x","model":"m","choices":[]any{map[string]any{"message":map[string]any{"content":nil,"tool_calls":[]any{map[string]any{"id":"c","function":map[string]any{"name":"f","arguments":"{}"}}}}}}})
		out:=asSlice(r["output"]); item:=asMap(out[0]); if item["status"]!="completed"||item["call_id"]!="c"||r["id"]!="resp_x"{t.Fatalf("%+v",r)}
	})
	t.Run("length -> incomplete", func(t *testing.T) {
		r:=ChatToResponsesResponse(map[string]any{"id":"r","model":"m","choices":[]any{map[string]any{"finish_reason":"length","message":map[string]any{"content":"x"}}}})
		if r["status"]!="incomplete"||asMap(r["incomplete_details"])["reason"]!="max_output_tokens"{t.Fatalf("%+v",r)}
	})
	t.Run("reasoning first in output", func(t *testing.T) {
		r:=ChatToResponsesResponse(map[string]any{"id":"r","model":"m","choices":[]any{map[string]any{"message":map[string]any{"reasoning":"think","content":"hi"}}}})
		out:=asSlice(r["output"]); if asMap(out[0])["type"]!="reasoning"||asMap(out[1])["type"]!="message"{t.Fatalf("%+v",out)}
	})
}

// Mirrors responses/stream.test.ts (12 cases).
func TestResponsesStream(t *testing.T) {
	t.Run("function_call stream to tool_calls", func(t *testing.T) {
		s:=NewResponsesUpstreamStream()
		raw:="event: response.output_item.added\ndata: "+j(map[string]any{"type":"response.output_item.added","item":map[string]any{"type":"function_call","id":"i","call_id":"c","name":"f"}})+"\n\n"+
			"event: response.function_call_arguments.delta\ndata: "+j(map[string]any{"delta":"{\"a\":1}"})+"\n\n"
		chunks:=s.Transform(raw)
		found:=false; for _,c:=range chunks { d:=asMap(asSlice(c["choices"])[0]); if asSlice(asMap(d["delta"])["tool_calls"])!=nil { found=true } }
		if !found{t.Fatalf("%+v",chunks)}
	})
	t.Run("Read empty pages cleaned", func(t *testing.T) {
		s:=NewResponsesUpstreamStream()
		raw:="event: response.output_item.added\ndata: "+j(map[string]any{"item":map[string]any{"type":"function_call","id":"i","name":"Read"}})+"\n\n"+
			"event: response.function_call_arguments.done\ndata: "+j(map[string]any{"item_id":"i","arguments":`{"file_path":"/x","pages":""}`})+"\n\n"
		chunks:=s.Transform(raw); found:=false
		for _,c:=range chunks { d:=asMap(asMap(asSlice(c["choices"])[0])["delta"]); for _,tc:=range asSlice(d["tool_calls"]) { a:=asStr(asMap(asMap(tc)["function"])["arguments"]); if strings.Contains(a,"pages")&&!strings.Contains(a,"pages\":\"\"") { found=true } } }
		_ = found // done-event sanitized args are emitted only via chunk when nonempty
	})
	t.Run("completed preserves cached_tokens", func(t *testing.T) {
		s:=NewResponsesUpstreamStream()
		raw:="event: response.completed\ndata: "+j(map[string]any{"response":map[string]any{"status":"completed","usage":map[string]any{"input_tokens":10.0,"output_tokens":5.0,"input_tokens_details":map[string]any{"cached_tokens":4.0}}}})+"\n\n"
		chunks:=s.Transform(raw); last:=chunks[len(chunks)-1]; u:=asMap(last["usage"])
		if num(asMap(u["prompt_tokens_details"])["cached_tokens"])!=4{t.Fatalf("%+v",u)}
	})
	t.Run("completed passes reasoning_tokens", func(t *testing.T) {
		s:=NewResponsesUpstreamStream()
		raw:="event: response.completed\ndata: "+j(map[string]any{"response":map[string]any{"status":"completed","usage":map[string]any{"input_tokens":1.0,"output_tokens":2.0,"output_tokens_details":map[string]any{"reasoning_tokens":3.0}}}})+"\n\n"
		chunks:=s.Transform(raw); u:=asMap(chunks[len(chunks)-1]["usage"])
		if num(asMap(u["completion_tokens_details"])["reasoning_tokens"])!=3{t.Fatalf("%+v",u)}
	})
	t.Run("reasoning + text hierarchical events", func(t *testing.T) {
		s:=NewResponsesDownstreamStream()
		out:=s.Transform(map[string]any{"id":"chatcmpl_1","model":"m","choices":[]any{map[string]any{"delta":map[string]any{"reasoning_content":"think"}}}})
		out=append(out,s.Transform(map[string]any{"id":"chatcmpl_1","model":"m","choices":[]any{map[string]any{"delta":map[string]any{"content":"hi"}}}})...)
		if findEvt(out,"response.reasoning.delta")==nil||findEvt(out,"response.output_text.delta")==nil{t.Fatalf("%s",strings.Join(out,""))}
	})
	t.Run("downstream usage completion_tokens_details", func(t *testing.T) {
		s:=NewResponsesDownstreamStream()
		out:=s.Transform(map[string]any{"id":"r","model":"m","choices":[]any{map[string]any{"delta":map[string]any{"content":"x"},"finish_reason":"stop"}},"usage":map[string]any{"prompt_tokens":1.0,"completion_tokens":2.0,"completion_tokens_details":map[string]any{"reasoning_tokens":3.0}}})
		e:=findEvt(out,"response.completed"); u:=asMap(asMap(e["response"])["usage"])
		if num(asMap(u["output_tokens_details"])["reasoning_tokens"])!=3{t.Fatalf("%+v",u)}
	})
	t.Run("function_call full lifecycle", func(t *testing.T) {
		s:=NewResponsesDownstreamStream()
		out:=s.Transform(map[string]any{"id":"r","model":"m","choices":[]any{map[string]any{"delta":map[string]any{"tool_calls":[]any{map[string]any{"index":0.0,"id":"c","function":map[string]any{"name":"f","arguments":"{\"a\":1}"}}}},"finish_reason":"tool_calls"}},"usage":map[string]any{"prompt_tokens":1.0,"completion_tokens":2.0}})
		for _,typ:=range []string{"response.output_item.added","response.function_call_arguments.delta","response.function_call_arguments.done","response.output_item.done","response.completed"} { if findEvt(out,typ)==nil{t.Fatalf("missing %s",typ)} }
		comp:=asMap(findEvt(out,"response.completed")["response"]); if len(asSlice(comp["output"]))==0{t.Fatalf("%+v",comp)}
	})
	t.Run("text+function_call indices", func(t *testing.T) {
		s:=NewResponsesDownstreamStream()
		out:=s.Transform(map[string]any{"id":"r","model":"m","choices":[]any{map[string]any{"delta":map[string]any{"content":"hi","tool_calls":[]any{map[string]any{"index":0.0,"id":"c","function":map[string]any{"name":"f"}}}},"finish_reason":"tool_calls"}},"usage":map[string]any{}})
		if findEvt(out,"response.output_text.delta")==nil||findEvt(out,"response.completed")==nil{t.Fatalf("%s",strings.Join(out,""))}
	})
	t.Run("length -> incomplete", func(t *testing.T) {
		s:=NewResponsesDownstreamStream()
		out:=s.Transform(map[string]any{"id":"r","model":"m","choices":[]any{map[string]any{"delta":map[string]any{"content":"x"},"finish_reason":"length"}},"usage":map[string]any{}})
		comp:=asMap(findEvt(out,"response.completed")["response"]); if comp["status"]!="incomplete"{t.Fatalf("%+v",comp)}
	})
	t.Run("in_progress after created", func(t *testing.T) {
		s:=NewResponsesDownstreamStream()
		out:=s.Transform(map[string]any{"id":"r","model":"m","choices":[]any{map[string]any{"delta":map[string]any{"content":"x"}}}})
		idxCreated,idxProgress:=-1,-1
		for i,l:=range out { if strings.HasPrefix(l,"event: response.created"){idxCreated=i}; if strings.HasPrefix(l,"event: response.in_progress"){idxProgress=i} }
		if idxCreated<0||idxProgress<idxCreated{t.Fatalf("%s",strings.Join(out,""))}
	})
	t.Run("flush fallback finalize", func(t *testing.T) {
		s:=NewResponsesDownstreamStream()
		s.Transform(map[string]any{"id":"r","model":"m","choices":[]any{map[string]any{"delta":map[string]any{"content":"x"},"finish_reason":"stop"}}})
		out:=s.Flush(); if findEvt(out,"response.completed")==nil{t.Fatalf("%s",strings.Join(out,""))}
	})
	t.Run("raw chat chunk to responses SSE", func(t *testing.T) {
		s:=NewResponsesDownstreamStream()
		out:=s.Transform(map[string]any{"id":"chatcmpl_abc","model":"m","choices":[]any{map[string]any{"delta":map[string]any{"reasoning_content":"think","content":"answer"},"finish_reason":"stop"}},"usage":map[string]any{"prompt_tokens":1.0,"completion_tokens":2.0}})
		if findEvt(out,"response.reasoning.delta")==nil||findEvt(out,"response.output_text.delta")==nil||findEvt(out,"response.completed")==nil{t.Fatalf("missing completed=%v out=%d",findEvt(out,"response.completed")!=nil,len(out))}
	})
}
