package responses

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"
)

func sse(event string, data any) string { b,_:=json.Marshal(data); return "event: "+event+"\ndata: "+string(b)+"\n\n" }
func cid(id string) string { return "chatcmpl_"+id }
func chunk(id,model string,created int64,delta map[string]any,finish any,usage any) map[string]any {
	choice:=map[string]any{"index":0,"delta":delta,"finish_reason":finish}
	c:=map[string]any{"id":cid(id),"object":"chat.completion.chunk","created":created,"model":model,"choices":[]any{choice}}
	if usage!=nil { c["usage"]=usage }
	return c
}

// ResponsesUpstreamStream converts upstream named-event SSE to chat chunks.
type ResponsesUpstreamStream struct {
	messageID, model, buf string
	hasTool bool
	nextIdx int
	idxByKey map[string]int
	open map[int]bool
	fallback, currentText *int
	toolByItem map[string]int
	nameByIdx map[int]string
	argsByIdx map[int]string
	lastTool *int
	created int64
}
func NewResponsesUpstreamStream() *ResponsesUpstreamStream {
	return &ResponsesUpstreamStream{messageID:fmt.Sprintf("resp_%d",time.Now().UnixMilli()),idxByKey:map[string]int{},open:map[int]bool{},toolByItem:map[string]int{},nameByIdx:map[int]string{},argsByIdx:map[int]string{},created:time.Now().Unix()}
}
func (s *ResponsesUpstreamStream) assignIdx(data map[string]any) int {
	key:=""; itemID:=asStr(data["item_id"]); ci:=data["content_index"]; oi:=data["output_index"]
	if itemID!=""&&ci!=nil { key=fmt.Sprintf("part:%s:%v",itemID,ci) } else if oi!=nil&&ci!=nil { key=fmt.Sprintf("part:out:%v:%v",oi,ci) }
	if key!="" { if i,ok:=s.idxByKey[key];ok { return i }; i:=s.nextIdx; s.nextIdx++; s.idxByKey[key]=i; return i }
	if s.fallback!=nil { return *s.fallback }
	i:=s.nextIdx; s.nextIdx++; s.fallback=&i; return i
}
func (s *ResponsesUpstreamStream) closeText(out *[]map[string]any) {
	if s.currentText==nil { return }
	idx:=*s.currentText; s.currentText=nil
	if s.open[idx] { delete(s.open,idx); *out=append(*out,chunk(s.messageID,s.model,s.created,map[string]any{},nil,nil)) }
	if s.fallback!=nil&&*s.fallback==idx { s.fallback=nil }
}
func sanitizeReadArgs(raw string) string {
	if raw=="" { return raw }
	var obj map[string]any
	if err:=json.Unmarshal([]byte(raw),&obj);err!=nil { return raw }
	if v,ok:=obj["pages"];ok { if str,ok:=v.(string);ok&&str=="" { delete(obj,"pages") } }
	b,_:=json.Marshal(obj); return string(b)
}
func (s *ResponsesUpstreamStream) Transform(raw string) []map[string]any {
	s.buf+=raw; out:=[]map[string]any{}
	for {
		pos:=strings.Index(s.buf,"\n\n"); if pos<0 { break }
		block:=s.buf[:pos]; s.buf=s.buf[pos+2:]
		if strings.TrimSpace(block)=="" { continue }
		eventType:=""; dataParts:=[]string{}
		for _,line:=range strings.Split(block,"\n") {
			if strings.HasPrefix(line,"event:") { eventType=strings.TrimSpace(line[6:]) }
			if strings.HasPrefix(line,"data:") { dataParts=append(dataParts,strings.TrimSpace(line[5:])) }
		}
		if len(dataParts)==0 { continue }
		var data map[string]any
		if json.Unmarshal([]byte(strings.Join(dataParts,"\n")),&data)!=nil { continue }
		resp:=asMap(data["response"]); if resp==nil { resp=data }
		switch eventType {
		case "response.created":
			if id:=asStr(resp["id"]);id!="" { s.messageID=id }
			if m:=asStr(resp["model"]);m!="" { s.model=m }
			var usage any
			if u:=asMap(resp["usage"]);u!=nil { usage=map[string]any{"prompt_tokens":num(u["input_tokens"]),"completion_tokens":0} }
			out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{"role":"assistant"},nil,usage))
		case "response.content_part.added":
			p:=asMap(data["part"]); if asStr(p["type"])=="output_text"||asStr(p["type"])=="refusal" {
				if s.currentText==nil { i:=s.assignIdx(data); s.currentText=&i }
				idx:=*s.currentText
				if !s.open[idx] { s.open[idx]=true; out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{"content":""},nil,nil)) }
			}
		case "response.output_text.delta","response.refusal.delta":
			delta:=asStr(data["delta"]); if delta=="" { break }
			if s.currentText==nil { i:=s.assignIdx(data); s.currentText=&i }
			idx:=*s.currentText
			if !s.open[idx] { s.open[idx]=true; out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{"content":""},nil,nil)) }
			out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{"content":delta},nil,nil))
		case "response.output_item.added":
			item:=asMap(data["item"]); if asStr(item["type"])=="function_call" {
				s.hasTool=true; s.closeText(&out)
				key:=""; if id:=asStr(item["id"]);id!="" { key="tool:"+id } else if id:=asStr(data["item_id"]);id!="" { key="tool:"+id } else { key=fmt.Sprintf("tool:out:%v",orNum(data["output_index"],s.nextIdx)) }
				idx,ok:=s.idxByKey[key]; if !ok { idx=s.nextIdx; s.nextIdx++; s.idxByKey[key]=idx }
				if id:=asStr(item["id"]);id!="" { s.toolByItem[id]=idx }
				s.nameByIdx[idx]=asStr(item["name"]); t:=idx; s.lastTool=&t
				if !s.open[idx] {
					s.open[idx]=true
					tc:=[]any{map[string]any{"index":idx,"id":orStr(item["call_id"],""),"type":"function","function":map[string]any{"name":orStr(item["name"],""),"arguments":""}}}
					out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{"tool_calls":tc},nil,nil))
				}
			}
		case "response.function_call_arguments.delta":
			delta:=asStr(data["delta"]); if delta=="" { break }
			itemID:=asStr(data["item_id"]); idx:=-1
			if i,ok:=s.toolByItem[itemID];ok { idx=i } else if s.lastTool!=nil { idx=*s.lastTool } else { idx=s.nextIdx; s.nextIdx++ }
			if !s.open[idx] {
				s.open[idx]=true
				callID:=orStr(data["call_id"],itemID); name:=orStr(data["name"],s.nameByIdx[idx])
				tc:=[]any{map[string]any{"index":idx,"id":callID,"type":"function","function":map[string]any{"name":name,"arguments":""}}}
				out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{"tool_calls":tc},nil,nil))
			}
			if s.nameByIdx[idx]=="Read" { s.argsByIdx[idx]+=delta; break }
			tc:=[]any{map[string]any{"index":idx,"type":"function","function":map[string]any{"arguments":delta}}}
			out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{"tool_calls":tc},nil,nil))
		case "response.function_call_arguments.done":
			itemID:=asStr(data["item_id"]); idx:=-1
			if i,ok:=s.toolByItem[itemID];ok { idx=i } else if s.lastTool!=nil { idx=*s.lastTool }
			if idx<0 { break }
			if s.nameByIdx[idx]=="Read" {
				raw:=orStr(data["arguments"],s.argsByIdx[idx]); sanitized:=sanitizeReadArgs(raw)
				if sanitized!="" { tc:=[]any{map[string]any{"index":idx,"type":"function","function":map[string]any{"arguments":sanitized}}}; out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{"tool_calls":tc},nil,nil)) }
			}
			delete(s.open,idx); delete(s.toolByItem,itemID); delete(s.nameByIdx,idx); delete(s.argsByIdx,idx)
		case "response.reasoning.delta":
			delta:=asStr(data["delta"]); if delta=="" { delta=asStr(data["text"]) }; if delta=="" { break }
			s.closeText(&out)
			idx:=s.assignIdx(data)
			if !s.open[idx] { s.open[idx]=true; out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{"reasoning_content":""},nil,nil)) }
			out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{"reasoning_content":delta},nil,nil))
		case "response.completed":
			stop:="stop"; if s.hasTool&&asStr(resp["status"])=="completed" { stop="tool_calls" } else if asStr(resp["status"])=="incomplete" { if asStr(asMap(resp["incomplete_details"])["reason"])=="max_output_tokens" { stop="length" } }
			idxs:=[]int{}; for i:=range s.open { idxs=append(idxs,i) }; sort.Ints(idxs)
			for _,i:=range idxs { delete(s.open,i); out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{},nil,nil)) }
			s.fallback=nil
			var usage any
			if u:=asMap(resp["usage"]);u!=nil {
				in:=num(u["input_tokens"]); oc:=num(u["output_tokens"])
				us:=map[string]any{"prompt_tokens":in,"completion_tokens":oc,"total_tokens":in+oc}
				if d:=asMap(u["input_tokens_details"]);d!=nil&&d["cached_tokens"]!=nil { us["prompt_tokens_details"]=map[string]any{"cached_tokens":d["cached_tokens"]} } else if d:=asMap(u["prompt_tokens_details"]);d!=nil&&d["cached_tokens"]!=nil { us["prompt_tokens_details"]=map[string]any{"cached_tokens":d["cached_tokens"]} }
				if d:=asMap(u["output_tokens_details"]);d!=nil&&d["reasoning_tokens"]!=nil { us["completion_tokens_details"]=map[string]any{"reasoning_tokens":d["reasoning_tokens"]} } else if d:=asMap(u["completion_tokens_details"]);d!=nil&&d["reasoning_tokens"]!=nil { us["completion_tokens_details"]=map[string]any{"reasoning_tokens":d["reasoning_tokens"]} }
				usage=us
			}
			out=append(out,chunk(s.messageID,s.model,s.created,map[string]any{},stop,usage))
		}
	}
	return out
}
func (s *ResponsesUpstreamStream) Flush() []map[string]any { return nil }
func orNum(v any, def int) int { if n:=num(v);n!=0 { return int(n) }; return def }

// ResponsesDownstreamStream converts chat chunks to named-event SSE.
type ResponsesDownstreamStream struct {
	responseID string; seq int; created int64; createdEmitted bool
	reasoningAdded,textAdded bool; reasoningID,textID string; reasoningIdx,textIdx int; reasoningText,textText string
	toolOrder []int; tools map[int]*toolState
	pending map[string]any; finalized bool
}
type toolState struct{ outIdx int; itemID,callID,name,args string; started bool }
func NewResponsesDownstreamStream() *ResponsesDownstreamStream { return &ResponsesDownstreamStream{created:time.Now().Unix(),tools:map[int]*toolState{}} }
func (s *ResponsesDownstreamStream) next() int { s.seq++; return s.seq }
func (s *ResponsesDownstreamStream) toResponseID(id string) string { return toResponseID(id) }
func (s *ResponsesDownstreamStream) ensureCreated(chunk map[string]any) []string {
	if s.createdEmitted { return nil }; s.createdEmitted=true
	resp:=map[string]any{"id":s.responseID,"object":"response","created_at":s.created,"model":chunk["model"],"status":"in_progress","output":[]any{},"usage":nil}
	return []string{sse("response.created",map[string]any{"type":"response.created","response":resp,"sequence_number":s.next()}),sse("response.in_progress",map[string]any{"type":"response.in_progress","response":resp,"sequence_number":s.next()})}
}
func (s *ResponsesDownstreamStream) Transform(ch map[string]any) []string {
	out:=[]string{}
	choices:=asSlice(ch["choices"]); if len(choices)==0 { return out }
	choice:=asMap(choices[0]); delta:=asMap(choice["delta"])
	if id:=asStr(ch["id"]);id!="" { s.responseID=s.toResponseID(id) }
	if c:=ch["created"];c!=nil { s.created=int64(num(c)) }
	out=append(out,s.ensureCreated(ch)...)
	if r:=orStr(delta["reasoning_content"],asStr(delta["reasoning"]));r!="" {
		if !s.reasoningAdded {
			s.reasoningAdded=true; s.reasoningID="rs_"+orStr(s.responseID,"resp"); s.reasoningIdx=0
			item:=map[string]any{"id":s.reasoningID,"type":"reasoning","status":"in_progress","summary":[]any{}}
			out=append(out,sse("response.output_item.added",map[string]any{"type":"response.output_item.added","output_index":0,"item":item,"sequence_number":s.next()}))
		}
		s.reasoningText+=r
		out=append(out,sse("response.reasoning.delta",map[string]any{"type":"response.reasoning.delta","item_id":s.reasoningID,"output_index":s.reasoningIdx,"content_index":0,"delta":r,"sequence_number":s.next()}))
	}
	if text:=asStr(delta["content"]);text!="" {
		if !s.textAdded {
			s.textAdded=true; s.textID=orStr(s.responseID,"resp")+"_msg"; s.textIdx=0; if s.reasoningAdded { s.textIdx=1 }
			item:=map[string]any{"id":s.textID,"type":"message","status":"in_progress","role":"assistant","content":[]any{}}
			out=append(out,sse("response.output_item.added",map[string]any{"type":"response.output_item.added","output_index":s.textIdx,"item":item,"sequence_number":s.next()}))
			out=append(out,sse("response.content_part.added",map[string]any{"type":"response.content_part.added","item_id":s.textID,"output_index":s.textIdx,"content_index":0,"part":map[string]any{"type":"output_text","text":"","annotations":[]any{}},"sequence_number":s.next()}))
		}
		s.textText+=text
		out=append(out,sse("response.output_text.delta",map[string]any{"type":"response.output_text.delta","item_id":s.textID,"output_index":s.textIdx,"content_index":0,"delta":text,"sequence_number":s.next()}))
	}
	for _,raw:=range asSlice(delta["tool_calls"]) {
		tc:=asMap(raw); idx:=int(num(tc["index"])); st:=s.tools[idx]
		if st==nil { st=&toolState{outIdx:(map[bool]int{true:1,false:0}[s.reasoningAdded])+(map[bool]int{true:1,false:0}[s.textAdded])+len(s.toolOrder),callID:fmt.Sprintf("call_%d",idx)}; s.tools[idx]=st; s.toolOrder=append(s.toolOrder,idx) }
		if id:=asStr(tc["id"]);id!="" { st.callID=id }
		if n:=asStr(asMap(tc["function"])["name"]);n!="" { st.name=n }
		st.itemID=fmt.Sprintf("fc_%d",st.outIdx)
		if !st.started&&(asStr(tc["id"])!=""||st.name!="") { st.started=true; out=append(out,sse("response.output_item.added",map[string]any{"type":"response.output_item.added","output_index":st.outIdx,"item":map[string]any{"id":st.itemID,"type":"function_call","status":"in_progress","call_id":st.callID,"name":st.name,"arguments":""},"sequence_number":s.next()})) }
		if a:=asStr(asMap(tc["function"])["arguments"]);a!="" {
			if !st.started { st.started=true; out=append(out,sse("response.output_item.added",map[string]any{"type":"response.output_item.added","output_index":st.outIdx,"item":map[string]any{"id":st.itemID,"type":"function_call","status":"in_progress","call_id":st.callID,"name":st.name,"arguments":""},"sequence_number":s.next()})) }
			st.args+=a
			out=append(out,sse("response.function_call_arguments.delta",map[string]any{"type":"response.function_call_arguments.delta","item_id":st.itemID,"output_index":st.outIdx,"delta":a,"sequence_number":s.next()}))
		}
	}
	_, hasUsage := ch["usage"]
	if fr:=asStr(choice["finish_reason"]);fr!="" {
		s.pending=ch
		if hasUsage { out=append(out,s.finalize(ch)...) }
	} else if hasUsage&&s.pending!=nil {
		p:=map[string]any{}; for k,v:=range s.pending { p[k]=v }; p["usage"]=ch["usage"]
		out=append(out,s.finalize(p)...)
	}
	return out
}
func (s *ResponsesDownstreamStream) Flush() []string { if s.pending!=nil&&!s.finalized { return s.finalize(s.pending) }; return nil }
func (s *ResponsesDownstreamStream) finalize(ch map[string]any) []string {
	if s.finalized { return nil }; s.finalized=true
	out:=[]string{}
	choices:=asSlice(ch["choices"]); var choice map[string]any; if len(choices)>0 { choice=asMap(choices[0]) }
	u:=asMap(ch["usage"]); in:=num(u["prompt_tokens"]); if in==0 { in=num(u["input_tokens"]) }; oc:=num(u["completion_tokens"]); if oc==0 { oc=num(u["output_tokens"]) }; total:=num(u["total_tokens"]); if total==0 { total=in+oc }
	idDetails:=asMap(u["prompt_tokens_details"]); if idDetails==nil { idDetails=asMap(u["input_tokens_details"]) }
	cached:=num(idDetails["cached_tokens"]); cacheWrite:=num(idDetails["cache_write_tokens"]); if cacheWrite==0 { cacheWrite=num(u["cache_creation_input_tokens"]) }
	inDetail:=map[string]any{"cached_tokens":cached}; if cacheWrite>0 { inDetail["cache_write_tokens"]=cacheWrite }
	od:=asMap(u["completion_tokens_details"]); if od==nil { od=asMap(u["output_tokens_details"]) }
	outDetail:=map[string]any{"reasoning_tokens":0}; for k,v:=range od { outDetail[k]=v }; if outDetail["reasoning_tokens"]==nil { outDetail["reasoning_tokens"]=0 }
	usage:=map[string]any{"input_tokens":in,"input_tokens_details":inDetail,"output_tokens":oc,"total_tokens":total,"output_tokens_details":outDetail}
	items:=[]any{}
	if s.reasoningAdded {
		item:=map[string]any{"id":s.reasoningID,"type":"reasoning","summary":[]any{map[string]any{"type":"summary_text","text":s.reasoningText}}}
		items=append(items,item); out=append(out,sse("response.output_item.done",map[string]any{"type":"response.output_item.done","output_index":s.reasoningIdx,"item":item,"sequence_number":s.next()}))
	}
	if s.textAdded {
		out=append(out,sse("response.output_text.done",map[string]any{"type":"response.output_text.done","item_id":s.textID,"output_index":s.textIdx,"content_index":0,"text":s.textText,"sequence_number":s.next()}))
		out=append(out,sse("response.content_part.done",map[string]any{"type":"response.content_part.done","item_id":s.textID,"output_index":s.textIdx,"content_index":0,"part":map[string]any{"type":"output_text","text":s.textText,"annotations":[]any{}},"sequence_number":s.next()}))
		item:=map[string]any{"id":s.textID,"type":"message","status":"completed","role":"assistant","content":[]any{map[string]any{"type":"output_text","text":s.textText,"annotations":[]any{}}}}
		items=append(items,item); out=append(out,sse("response.output_item.done",map[string]any{"type":"response.output_item.done","output_index":s.textIdx,"item":item,"sequence_number":s.next()}))
	}
	for _,idx:=range s.toolOrder {
		st:=s.tools[idx]
		out=append(out,sse("response.function_call_arguments.done",map[string]any{"type":"response.function_call_arguments.done","item_id":st.itemID,"output_index":st.outIdx,"arguments":st.args,"sequence_number":s.next()}))
		item:=map[string]any{"id":st.itemID,"type":"function_call","status":"completed","call_id":st.callID,"name":st.name,"arguments":st.args}
		items=append(items,item); out=append(out,sse("response.output_item.done",map[string]any{"type":"response.output_item.done","output_index":st.outIdx,"item":item,"sequence_number":s.next()}))
	}
	incomplete:=asStr(choice["finish_reason"])=="length"
	status:="completed"; var details any
	if incomplete { status="incomplete"; details=map[string]any{"reason":"max_output_tokens"} }
	resp:=map[string]any{"id":s.responseID,"object":"response","created_at":s.created,"status":status,"error":nil,"incomplete_details":details,"model":ch["model"],"output":items,"usage":usage}
	out=append(out,sse("response.completed",map[string]any{"type":"response.completed","response":resp,"sequence_number":s.next()}))
	return out
}
