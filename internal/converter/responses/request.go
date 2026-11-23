package responses

import (
	"encoding/json"
	"strings"

	"github.com/kkito/llm-gatego/internal/converter/canonical"
)

func asMap(v any) map[string]any { m, _ := v.(map[string]any); return m }
func asSlice(v any) []any { a, _ := v.([]any); return a }
func asStr(v any) string { s, _ := v.(string); return s }

func cloneMap(m map[string]any) map[string]any { o:=make(map[string]any,len(m)); for k,v:=range m { o[k]=v }; return o }

func ResponsesToChatRequest(body map[string]any) map[string]any {
	msgs := []any{}
	if ins := asStr(body["instructions"]); ins != "" {
		msgs = append(msgs, map[string]any{"role":"system","content":ins})
	}
	input := []any{}
	switch v := body["input"].(type) {
	case string: input = []any{map[string]any{"role":"user","content":v}}
	case []any: input = v
	}
	pending := []any{}
	reasoning := ""
	flush := func() {
		if len(pending)==0 { return }
		msg:=map[string]any{"role":"assistant","content":nil,"tool_calls":append([]any{},pending...)}
		if reasoning!="" { msg["reasoning"]=reasoning }
		msgs=append(msgs,msg); pending=nil; reasoning=""
	}
	for _, raw := range input {
		item := asMap(raw)
		switch asStr(item["type"]) {
		case "function_call":
			pending = append(pending, map[string]any{"id":asStr(item["call_id"]),"type":"function","function":map[string]any{"name":asStr(item["name"]),"arguments":orStr(item["arguments"],"{}")}})
			if r:=asStr(item["reasoning_content"]); r!="" && reasoning=="" { reasoning=r }
		case "function_call_output":
			flush()
			out := item["output"]; if out==nil { out=item["content"] }
			content := ""
			if s,ok:=out.(string);ok { content=s } else if out!=nil { b,_:=json.Marshal(out); content=string(b) }
			msgs=append(msgs,map[string]any{"role":"tool","content":content,"tool_call_id":asStr(item["call_id"])})
		default:
			flush()
			role := "assistant"
			switch asStr(item["role"]) { case "system","developer": role="system"; case "user": role="user" }
			msg:=map[string]any{"role":role,"content":responsesContentToChat(item["content"])}
			if r:=asStr(item["reasoning_content"]); r!="" && role=="assistant" { msg["reasoning"]=r }
			msgs=append(msgs,msg)
		}
	}
	flush()
	msgs = reorderToolMessages(msgs)
	req := map[string]any{"model":body["model"],"messages":msgs}
	if tools,ok:=body["tools"];ok {
		out:=[]any{}
		for _,raw:=range asSlice(tools) {
			t:=asMap(raw); if asStr(t["type"])!="function" { continue }
			fn:=asMap(t["function"]); if fn==nil { fn=t }
			params := fn["parameters"]; if params==nil { params=fn["input_schema"] }
			if params==nil { params=canonical.DefaultToolParameters }
			out=append(out,map[string]any{"type":"function","function":map[string]any{"name":fn["name"],"description":orStr(fn["description"],""),"parameters":params}})
		}
		req["tools"]=out
	}
	if tc:=body["tool_choice"];tc!=nil { req["tool_choice"]=mapToolChoiceToChat(tc) }
	req["max_tokens"]=body["max_output_tokens"]; req["stream"]=body["stream"]; req["temperature"]=body["temperature"]
	req["previousResponseId"]=body["previous_response_id"]; req["responseInstructions"]=body["instructions"]
	if v,ok:=body["top_p"];ok { req["top_p"]=v }
	if v,ok:=body["parallel_tool_calls"];ok { req["parallel_tool_calls"]=v }
	if text:=asMap(body["text"]);text["format"]!=nil { req["response_format"]=text["format"] }
	return req
}

func orStr(v any, def string) string { s:=asStr(v); if s=="" { return def }; return s }

func reorderToolMessages(msgs []any) []any {
	out:=[]any{}; i:=0
	for i<len(msgs) {
		msg:=asMap(msgs[i])
		if asStr(msg["role"])=="assistant" && len(asSlice(msg["tool_calls"]))>0 {
			want:=map[string]bool{}
			for _,tc:=range asSlice(msg["tool_calls"]) { want[asStr(asMap(tc)["id"])]=true }
			tools,sys:=[]any{},[]any{}
			j:=i+1
			for j<len(msgs) && len(want)>0 {
				next:=asMap(msgs[j])
				if asStr(next["role"])=="tool" && want[asStr(next["tool_call_id"])] { delete(want,asStr(next["tool_call_id"])); tools=append(tools,next) } else if asStr(next["role"])=="system" { sys=append(sys,next) } else { break }
				j++
			}
			out=append(out,sys...); out=append(out,msg); out=append(out,tools...); i=j
		} else { out=append(out,msg); i++ }
	}
	return out
}

func responsesContentToChat(content any) any {
	if s,ok:=content.(string);ok { return s }
	if content==nil { return "" }
	parts:=asSlice(content); if parts==nil { b,_:=json.Marshal(content); return string(b) }
	out:=[]any{}; buf:=""
	flush:=func(){ if buf!="" { out=append(out,map[string]any{"type":"text","text":buf}); buf="" } }
	for _,raw:=range parts {
		if s,ok:=raw.(string);ok { buf+=s; continue }
		c:=asMap(raw)
		switch asStr(c["type"]) {
		case "input_text","output_text","text": buf+=asStr(c["text"])
		case "input_image","image_url":
			flush(); url:=asStr(c["image_url"]); if m:=asMap(c["image_url"]);m!=nil { url=asStr(m["url"]) }
			out=append(out,map[string]any{"type":"image_url","image_url":map[string]any{"url":url}})
		case "input_audio": flush(); out=append(out,map[string]any{"type":"input_audio","input_audio":orMap(c["input_audio"],map[string]any{"data":orStr(c["data"],""),"format":orStr(c["format"],"mp3")})})
		case "input_file": flush(); out=append(out,map[string]any{"type":"file","file":map[string]any{"filename":c["filename"],"file_data":c["file_data"],"file_id":c["file_id"]}})
		default: buf+=asStr(c["text"])
		}
	}
	flush()
	if len(out)==0 { return buf }
	return out
}
func orMap(v any, def any) any { if v==nil { return def }; return v }

func chatContentToResponses(content any) any {
	if s,ok:=content.(string);ok { return s }
	if content==nil { return "" }
	parts:=asSlice(content); if parts==nil { return content }
	out:=[]any{}
	for _,raw:=range parts {
		c:=asMap(raw)
		switch asStr(c["type"]) {
		case "text": out=append(out,map[string]any{"type":"input_text","text":asStr(c["text"])})
		case "image_url": out=append(out,map[string]any{"type":"input_image","image_url":asStr(asMap(c["image_url"])["url"])})
		case "input_audio": out=append(out,map[string]any{"type":"input_audio","input_audio":c["input_audio"]})
		case "file": f:=asMap(c["file"]); out=append(out,map[string]any{"type":"input_file","filename":f["filename"],"file_data":f["file_data"],"file_id":f["file_id"]})
		}
	}
	if len(out)==1 && asStr(asMap(out[0])["type"])=="input_text" { return asMap(out[0])["text"] }
	return out
}

func mapToolChoiceToChat(tc any) any {
	if _,ok:=tc.(string);ok { return tc }
	m:=asMap(tc); if asStr(m["type"])=="function" { return map[string]any{"type":"function","function":map[string]any{"name":m["name"]}} }
	return tc
}
func mapChatToolChoiceToResponses(tc any) any {
	if _,ok:=tc.(string);ok { return tc }
	m:=asMap(tc); if asStr(m["type"])=="function" { return map[string]any{"type":"function","name":asMap(m["function"])["name"]} }
	return tc
}

func ChatToResponsesRequest(chat map[string]any) map[string]any {
	input:=[]any{}; var instructions string
	for _,raw:=range asSlice(chat["messages"]) {
		m:=asMap(raw)
		switch asStr(m["role"]) {
		case "system": instructions=asStr(m["content"])
		case "tool": input=append(input,map[string]any{"type":"function_call_output","call_id":orStr(m["tool_call_id"],""),"output":contentStr(m["content"])})
		case "assistant":
			if calls:=asSlice(m["tool_calls"]);len(calls)>0 {
				for _,rawTc:=range calls { tc:=asMap(rawTc); fn:=asMap(tc["function"]); input=append(input,map[string]any{"type":"function_call","call_id":tc["id"],"name":fn["name"],"arguments":fn["arguments"]}) }
			} else { input=append(input,map[string]any{"role":"assistant","content":chatContentToResponses(m["content"])}) }
		default: input=append(input,map[string]any{"role":m["role"],"content":chatContentToResponses(m["content"])})
		}
	}
	result:=map[string]any{"model":chat["model"],"input":input}
	if instructions!="" { result["instructions"]=instructions }
	if id:=asStr(chat["previousResponseId"]);id!="" { result["previous_response_id"]=id }
	if chat["tools"]!=nil {
		tools:=[]any{}
		for _,raw:=range asSlice(chat["tools"]) {
			fn:=asMap(asMap(raw)["function"])
			tool:=map[string]any{"type":"function","name":fn["name"],"description":fn["description"]}
			if fn["parameters"]!=nil { tool["parameters"]=fn["parameters"] } else { tool["parameters"]=canonical.DefaultToolParameters }
			tools=append(tools,tool)
		}
		result["tools"]=canonical.EnsureToolParameters(tools)
	}
	if tc:=chat["tool_choice"];tc!=nil {
		if s,clean:=sanitizeToolChoice(tc, asSlice(chat["tools"]));clean { result["tool_choice"]=s }
	}
	if chat["stream"]==true { result["stream"]=true }
	if chat["temperature"]!=nil { result["temperature"]=chat["temperature"] }
	if n:=num(chat["max_tokens"]);n!=0 { result["max_output_tokens"]=chat["max_tokens"] }
	if chat["top_p"]!=nil { result["top_p"]=chat["top_p"] }
	if chat["parallel_tool_calls"]!=nil { result["parallel_tool_calls"]=chat["parallel_tool_calls"] }
	if chat["response_format"]!=nil { result["text"]=map[string]any{"format":chat["response_format"]} }
	return result
}

func num(v any) float64 { switch n:=v.(type){case float64:return n;case int:return float64(n)}; return 0 }
func contentStr(v any) string { if s,ok:=v.(string);ok {return s}; b,_:=json.Marshal(v);return string(b) }
func sanitizeToolChoice(tc any, tools []any) (any,bool) {
	if len(tools)==0 { return nil,false }
	if s,ok:=tc.(string);ok { if s=="auto" { return s,true }; return "auto",true }
	mapped:=mapChatToolChoiceToResponses(tc)
	if m:=asMap(mapped);asStr(m["type"])=="function" {
		name:=asStr(m["name"]); found:=false
		for _,raw:=range tools { if asStr(asMap(asMap(raw)["function"])["name"])==name { found=true } }
		if !found { return "auto",true }
	}
	return mapped,true
}

var _ = strings.TrimSpace
