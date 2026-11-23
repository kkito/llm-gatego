package server

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/interceptor"
	"github.com/kkito/llm-gatego/internal/provider"
)

// Functional port of original testModelConnection(): sends a real upstream
// Chat/Responses request and returns content/reasoning/usage/raw response.
func writeTestJSON(w http.ResponseWriter, status int, payload map[string]any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func handleModelTest(w http.ResponseWriter, r *http.Request, d APIDeps) {
	var in struct {
		Provider      string         `json:"provider"`
		BaseURL       string         `json:"baseUrl"`
		APIKey        string         `json:"apiKey"`
		APIKeyID      string         `json:"apiKeyId"`
		RealModel     string         `json:"realModel"`
		Message       string         `json:"message"`
		Proxy         string         `json:"proxy"`
		DefaultParams map[string]any `json:"defaultParams"`
	}
	if !readJSON(w, r, &in) {
		return
	}
	if in.Provider == "" || in.BaseURL == "" || in.RealModel == "" {
		writeTestJSON(w, 400, map[string]any{"success": false, "message": "请填写所有必填字段（Provider、Base URL、实际模型名称）"})
		return
	}
	cfg, err := d.load()
	if err != nil {
		writeTestJSON(w, 500, map[string]any{"success": false, "message": err.Error()})
		return
	}
	key := in.APIKey
	if key == "" && in.APIKeyID != "" {
		for _, k := range cfg.ApiKeys {
			if k.ID == in.APIKeyID {
				key = k.Key
				break
			}
		}
	}
	if key == "" {
		for _, m := range cfg.Models {
			if m.RealModel == in.RealModel || m.CustomModel == in.RealModel {
				key = m.APIKey
				break
			}
		}
	}
	if strings.HasPrefix(key, "$$") && strings.HasSuffix(key, "$$") {
		resolved, err := config.ResolveAPIKey(key, cfg.ApiKeys)
		if err != nil {
			writeTestJSON(w, 200, map[string]any{"success": false, "message": "API Key 引用 " + key + " 不存在，请检查 API Key 配置"})
			return
		}
		key = resolved
	}
	if key == "" {
		writeTestJSON(w, 400, map[string]any{"success": false, "message": "请填写或选择 API Key"})
		return
	}

	pType := config.ProviderType(in.Provider)
	isResponses := pType == config.ProviderResponseAPI
	pc := &config.ProviderConfig{CustomModel: "", RealModel: in.RealModel, BaseURL: in.BaseURL, Provider: pType, APIKey: key}
	p := provider.GetProvider(pc)
	endpoint := "chat"
	if isResponses {
		endpoint = "responses"
	}
	urlStr := p.BuildURL(pc, endpoint)
	reqBody := map[string]any{"model": in.RealModel, "max_tokens": 4096}
	if isResponses {
		delete(reqBody, "max_tokens")
		reqBody["max_output_tokens"] = 4096
		reqBody["input"] = []any{map[string]any{"role": "user", "content": []any{map[string]any{"type": "input_text", "text": defaultTestMessage(in.Message)}}}}
	} else {
		reqBody["messages"] = []any{map[string]any{"role": "user", "content": defaultTestMessage(in.Message)}}
	}
	if len(in.DefaultParams) > 0 {
		reqBody = deepMergeAny(in.DefaultParams, reqBody)
	}
	headers, reqBody := applyModelTestInterceptors(pc, reqBody)
	reqJSON, _ := json.Marshal(reqBody)
	client := &http.Client{Timeout: 60 * time.Second}
	if in.Proxy != "" {
		if pu, err := url.Parse(in.Proxy); err == nil {
			client.Transport = &http.Transport{Proxy: http.ProxyURL(pu)}
		}
	}
	req, err := http.NewRequestWithContext(r.Context(), http.MethodPost, urlStr, bytes.NewReader(reqJSON))
	if err != nil {
		writeTestJSON(w, 200, map[string]any{"success": false, "message": "网络错误: " + err.Error()})
		return
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		writeTestJSON(w, 200, map[string]any{"success": false, "message": "网络错误: " + err.Error()})
		return
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	requestBody, _ := json.MarshalIndent(reqBody, "", "  ")
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		writeTestJSON(w, 200, map[string]any{"success": false, "message": "HTTP " + strconv.Itoa(resp.StatusCode) + ": " + string(raw), "rawResponse": string(raw), "requestBody": string(requestBody)})
		return
	}
	var data map[string]any
	if json.Unmarshal(raw, &data) != nil {
		writeTestJSON(w, 200, map[string]any{"success": true, "model": in.RealModel, "content": string(raw), "requestBody": string(requestBody), "fullResponse": string(raw)})
		return
	}
	content, reasoning := extractTestContent(data, isResponses)
	fullResp, _ := json.MarshalIndent(data, "", "  ")
	usage := map[string]any{}
	if u, ok := data["usage"].(map[string]any); ok {
		if isResponses {
			usage["prompt_tokens"] = numOrZero(u["input_tokens"])
			usage["completion_tokens"] = numOrZero(u["output_tokens"])
		} else {
			usage["prompt_tokens"] = numOrZero(u["prompt_tokens"])
			usage["completion_tokens"] = numOrZero(u["completion_tokens"])
		}
	}
	modelName := in.RealModel
	if m, ok := data["model"].(string); ok {
		modelName = m
	}
	writeTestJSON(w, 200, map[string]any{"success": true, "model": modelName, "content": content, "reasoningContent": reasoning, "usage": usage, "requestBody": string(requestBody), "fullResponse": string(fullResp)})
}
func defaultTestMessage(s string) string {
	if s == "" {
		return "请介绍一下你自己"
	}
	return s
}
func numOrZero(v any) int64 {
	switch n := v.(type) {
	case float64:
		return int64(n)
	case int64:
		return n
	case int:
		return int64(n)
	}
	return 0
}
func deepMergeAny(base, override map[string]any) map[string]any {
	out := map[string]any{}
	for k, v := range base {
		out[k] = v
	}
	for k, v := range override {
		if bm, ok := out[k].(map[string]any); ok {
			if om, ok := v.(map[string]any); ok {
				out[k] = deepMergeAny(bm, om)
				continue
			}
		}
		out[k] = v
	}
	return out
}
func extractTestContent(data map[string]any, isResponses bool) (string, string) {
	var content, reasoning string
	if isResponses {
		if arr, ok := data["output"].([]any); ok {
			for _, item := range arr {
				m, _ := item.(map[string]any)
				switch m["type"] {
				case "message":
					if parts, ok := m["content"].([]any); ok {
						for _, p := range parts {
							pm, _ := p.(map[string]any)
							if pm["type"] == "output_text" || pm["type"] == "text" {
								if s, ok := pm["text"].(string); ok {
									content += s
								}
							}
						}
					}
				case "reasoning":
					if s, ok := m["text"].(string); ok {
						reasoning += s
					}
				}
			}
		}
		return content, reasoning
	}
	if choices, ok := data["choices"].([]any); ok && len(choices) > 0 {
		if c, ok := choices[0].(map[string]any); ok {
			if m, ok := c["message"].(map[string]any); ok {
				if s, ok := m["content"].(string); ok {
					content = s
				}
				if s, ok := m["reasoning_content"].(string); ok {
					reasoning = s
				} else if s, ok := m["reasoning"].(string); ok {
					reasoning = s
				}
			}
		}
	}
	if arr, ok := data["content"].([]any); ok {
		var texts, thinks []string
		for _, b := range arr {
			m, _ := b.(map[string]any)
			if s, ok := m["text"].(string); ok {
				if m["type"] == "text" {
					texts = append(texts, s)
				}
			}
			if s, ok := m["thinking"].(string); ok {
				if m["type"] == "thinking" {
					thinks = append(thinks, s)
				}
			}
		}
		if len(texts) > 0 {
			content = strings.Join(texts, "\n\n")
		}
		if len(thinks) > 0 {
			reasoning = strings.Join(thinks, "\n\n")
		}
	}
	return content, reasoning
}

func applyModelTestInterceptors(pc *config.ProviderConfig, body map[string]any) (map[string]string, map[string]any) {
	headers := map[string]string{}
	for k, v := range provider.GetProvider(pc).BuildHeaders(pc.APIKey) {
		headers[k] = v
	}
	req := &interceptor.UpstreamRequest{
		URL:     pc.BaseURL,
		Headers: headers,
		Body:    body,
	}
	ctx := &interceptor.Context{Provider: pc, RequestPath: "/v1/chat/completions", CustomModel: pc.CustomModel}
	req, _ = interceptor.OpencodeSession(req, ctx)
	return req.Headers, req.Body
}
