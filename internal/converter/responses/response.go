package responses

import (
	"encoding/json"
	"fmt"
	"time"
)

func ResponsesToChatResponse(body map[string]any) map[string]any {
	content:=""; calls:=[]any{}
	for _,raw:=range asSlice(body["output"]) {
		item:=asMap(raw)
		switch asStr(item["type"]) {
		case "message":
			for _,rawP:=range asSlice(item["content"]) {
				p:=asMap(rawP)
				if asStr(p["type"])=="output_text"||asStr(p["type"])=="text"||asStr(p["type"])=="refusal" { content+=asStr(p["text"]) }
			}
		case "function_call":
			calls=append(calls,map[string]any{"id":orStr(item["call_id"],""),"type":"function","function":map[string]any{"name":orStr(item["name"],""),"arguments":orStr(item["arguments"],"{}")}})
		}
	}
	finish:="stop"; if len(calls)>0 { finish="tool_calls" } else if asStr(body["status"])=="inactive"||asStr(body["status"])=="incomplete" { finish="length" }
	msg:=map[string]any{"role":"assistant","content":content}; if content=="" { msg["content"]=nil }
	if len(calls)>0 { msg["tool_calls"]=calls }
	resp:=map[string]any{"id":body["id"],"object":"chat.completion","created":time.Now().Unix(),"model":body["model"],"choices":[]any{map[string]any{"index":0,"message":msg,"finish_reason":finish}}}
	if u:=asMap(body["usage"]);u!=nil {
		in:=num(u["input_tokens"]); out:=num(u["output_tokens"])
		resp["usage"]=map[string]any{"prompt_tokens":in,"completion_tokens":out,"total_tokens":in+out}
	}
	if v:=body["encrypted_content"];v!=nil { resp["responsesEncryptedContent"]=v }
	return resp
}

func toResponseID(id string) string {
	if id=="" { return fmt.Sprintf("resp_%d",time.Now().UnixMilli()) }
	if len(id)>=5&&id[:5]=="resp_" { return id }
	if len(id)>=9&&id[:9]=="chatcmpl_" { return "resp_"+id[9:] }
	return "resp_"+id
}

func ChatToResponsesResponse(chat map[string]any) map[string]any {
	choices:=asSlice(chat["choices"]); var choice,msg map[string]any
	if len(choices)>0 { choice=asMap(choices[0]); msg=asMap(choice["message"]) }
	output:=[]any{}
	if r:=asStr(msg["reasoning"]);r!="" { output=append(output,map[string]any{"id":"rs_"+toResponseID(asStr(chat["id"])),"type":"reasoning","summary":[]any{map[string]any{"type":"summary_text","text":r}}}) }
	if calls:=asSlice(msg["tool_calls"]);len(calls)>0 {
		for _,raw:=range calls {
			tc:=asMap(raw); fn:=asMap(tc["function"])
			output=append(output,map[string]any{"type":"function_call","call_id":tc["id"],"name":fn["name"],"arguments":fn["arguments"],"status":"completed"})
		}
	} else {
		text:=""; if msg["content"]!=nil { text=asStr(msg["content"]) }
		output=append(output,map[string]any{"type":"message","role":"assistant","status":"completed","content":[]any{map[string]any{"type":"output_text","text":text}}})
	}
	incomplete:=asStr(choice["finish_reason"])=="length"
	created:=chat["created"]; if created==nil { created=time.Now().Unix() }
	result:=map[string]any{"id":toResponseID(asStr(chat["id"])),"object":"response","created_at":created,"status":orStr(map[any]any{true:"incomplete",false:"completed"}[incomplete],"completed"),"error":nil,"incomplete_details":map[any]any{true:map[string]any{"reason":"max_output_tokens"},false:nil}[incomplete],"model":chat["model"],"output":output}
	if u:=asMap(chat["usage"]);u!=nil {
		inDetails:=asMap(u["prompt_tokens_details"]); if inDetails==nil { inDetails=asMap(u["input_tokens_details"]) }
		cached:=num(inDetails["cached_tokens"]); cacheWrite:=num(inDetails["cache_write_tokens"]); if cacheWrite==0 { cacheWrite=num(u["cache_creation_input_tokens"]) }
		outDetails:=asMap(u["completion_tokens_details"]); if outDetails==nil { outDetails=asMap(u["output_tokens_details"]) }
		inputDetails:=map[string]any{"cached_tokens":cached}; if cacheWrite>0 { inputDetails["cache_write_tokens"]=cacheWrite }
		outTokensDetails:=map[string]any{"reasoning_tokens":0}
		if len(outDetails)>0 { for k,v:=range outDetails { outTokensDetails[k]=v }; if outTokensDetails["reasoning_tokens"]==nil { outTokensDetails["reasoning_tokens"]=0 } }
		in:=num(u["prompt_tokens"]); out:=num(u["completion_tokens"]); total:=num(u["total_tokens"]); if total==0 { total=in+out }
		result["usage"]=map[string]any{"input_tokens":in,"input_tokens_details":inputDetails,"output_tokens":out,"total_tokens":total,"output_tokens_details":outTokensDetails}
	}
	if v:=chat["responsesEncryptedContent"];v!=nil { result["encrypted_content"]=v }
	return result
}

var _ = json.Marshal
