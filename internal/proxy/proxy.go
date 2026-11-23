package proxy

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/converter"
	"github.com/kkito/llm-gatego/internal/converter/anthropic"
	"github.com/kkito/llm-gatego/internal/converter/responses"
	"github.com/kkito/llm-gatego/internal/interceptor"
	"github.com/kkito/llm-gatego/internal/logger"
	"github.com/kkito/llm-gatego/internal/provider"
	"github.com/kkito/llm-gatego/internal/store"
	"github.com/kkito/llm-gatego/internal/util"
	"io"
	"net/http"
	"strings"
	"time"
)

type Dependencies struct {
	ConfigGetter func() *config.ProxyConfig
	Logger       *logger.Logger
	DetailLogger *logger.DetailLogger
	Timeout      time.Duration
	LogDir       string
	Interceptors *interceptor.Manager
	// RequestUser, when set, resolves the authenticated user for interceptor context.
	RequestUser func(*http.Request) *interceptor.CurrentUser
}

type Handler struct{ deps Dependencies }

func NewHandler(cfgGetter func() *config.ProxyConfig, log *logger.Logger, detail *logger.DetailLogger, timeout time.Duration, logDir string) http.Handler {
	return &Handler{deps: Dependencies{ConfigGetter: cfgGetter, Logger: log, DetailLogger: detail, Timeout: timeout, LogDir: logDir}}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	endpoint, source := endpointFor(r.URL.Path)
	if endpoint == "" {
		http.NotFound(w, r)
		return
	}
	cfg := h.deps.ConfigGetter()
	if cfg == nil {
		cfg = &config.ProxyConfig{}
	}
	var body map[string]any
	if r.Body != nil {
		b, _ := io.ReadAll(r.Body)
		if len(b) > 0 {
			if json.Unmarshal(b, &body) != nil {
				writeError(w, 400, "invalid JSON")
				return
			}
		}
	}
	if body == nil {
		body = map[string]any{}
	}
	model, _ := body["model"].(string)
	if model == "" {
		writeError(w, 400, "model is required")
		return
	}
	cfgs, findErr := findCandidates(cfg, model)
	if findErr != nil {
		writeError(w, 400, findErr.Error())
		return
	}
	if len(cfgs) == 0 {
		writeError(w, 400, fmt.Sprintf("Model '%s' not found", model))
		return
	}
	stream, _ := body["stream"].(bool)
	id := r.Header.Get("x-request-id")
	if id == "" {
		id = uuid.NewString()
	}
	ctxClientIP := util.ExtractClientIP(r)
	start := time.Now()
	var lastStatus int
	var lastBody map[string]any
	var lastErr error
	var realModel, groupName string
	for _, pc := range cfgs {
		var currentUser *interceptor.CurrentUser
		if h.deps.RequestUser != nil {
			if u := h.deps.RequestUser(r); u != nil {
				currentUser = &interceptor.CurrentUser{Name: u.Name, APIKey: u.APIKey, AllowedModels: u.AllowedModels}
			}
		}
		lastStatus, lastBody, lastErr, realModel, groupName = h.attempt(w, r, cfg, &pc, body, source, endpoint, stream, id, ctxClientIP, currentUser)
		if lastErr != nil || lastStatus == 429 {
			continue
		}
		if lastBody != nil || stream {
			break
		}
	}
	if lastStatus == 429 {
		writeError(w, 429, "rate limit exceeded")
		return
	}
	if lastErr != nil {
		writeError(w, 502, lastErr.Error())
		return
	}
	_ = realModel
	_ = groupName
	_ = start
}
func mergeDefaultParams(body map[string]any, defaults map[string]any) map[string]any {
	if len(defaults) == 0 {
		return body
	}
	out := map[string]any{}
	for k, v := range defaults {
		out[k] = deepCopyValue(v)
	}
	for k, v := range body {
		if k == "extra_body" {
			if dm, ok := defaults["extra_body"].(map[string]any); ok {
				if bm, ok := v.(map[string]any); ok {
					out[k] = deepMergeMaps(dm, bm)
					continue
				}
			}
		}
		out[k] = v
	}
	return out
}
func deepCopyValue(v any) any {
	switch x := v.(type) {
	case map[string]any:
		m := map[string]any{}
		for k, val := range x {
			m[k] = deepCopyValue(val)
		}
		return m
	case []any:
		a := make([]any, len(x))
		for i, val := range x {
			a[i] = deepCopyValue(val)
		}
		return a
	default:
		return v
	}
}
func deepMergeMaps(base, override map[string]any) map[string]any {
	out := map[string]any{}
	for k, v := range base {
		out[k] = deepCopyValue(v)
	}
	for k, v := range override {
		if bm, ok := out[k].(map[string]any); ok {
			if om, ok := v.(map[string]any); ok {
				out[k] = deepMergeMaps(bm, om)
				continue
			}
		}
		out[k] = v
	}
	return out
}

func endpointFor(path string) (string, converter.FormatName) {
	switch path {
	case "/chat/completions", "/v1/chat/completions", "/v1/v1/chat/completions":
		return "chat", converter.FormatChat
	case "/messages", "/v1/messages", "/v1/v1/messages":
		return "messages", converter.FormatAnthropic
	case "/responses", "/v1/responses":
		return "responses", converter.FormatResponses
	}
	return "", ""
}
func findCandidates(cfg *config.ProxyConfig, model string) ([]config.ProviderConfig, error) {
	out := []config.ProviderConfig{}
	for _, pc := range cfg.Models {
		if pc.CustomModel == model {
			out = append(out, pc)
		}
	}
	if len(out) > 0 {
		return out, nil
	}
	for _, g := range cfg.ModelGroups {
		if g.Name != model {
			continue
		}
		for _, name := range g.Models {
			models, err := findCandidates(cfg, name)
			if err != nil {
				return nil, err
			}
			if len(models) == 0 {
				available := []string{}
				for _, pc := range cfg.Models {
					available = append(available, pc.CustomModel)
				}
				return nil, fmt.Errorf("Model %q in group %q not found in provider configs. Available models: [%s]", name, model, strings.Join(available, ", "))
			}
			out = append(out, models...)
		}
		return out, nil
	}
	return out, nil
}
func providerFormat(p config.ProviderType) converter.FormatName {
	switch p {
	case config.ProviderAnthropic:
		return converter.FormatAnthropic
	case config.ProviderResponseAPI:
		return converter.FormatResponses
	default:
		return converter.FormatChat
	}
}
func toProviderBody(body map[string]any, source, target converter.FormatName) map[string]any {
	if source == target {
		return body
	}
	// normalize to chat canonical first
	chat := body
	switch source {
	case converter.FormatAnthropic:
		chat = anthropic.AnthropicToChatRequest(body)
	case converter.FormatResponses:
		chat = responses.ResponsesToChatRequest(body)
	}
	switch target {
	case converter.FormatAnthropic:
		return anthropic.ChatToAnthropicRequest(chat)
	case converter.FormatResponses:
		return responses.ChatToResponsesRequest(chat)
	}
	return chat
}
func fromProviderBody(body map[string]any, providerFormat, clientFormat converter.FormatName, model string) map[string]any {
	chat := body
	switch providerFormat {
	case converter.FormatAnthropic:
		chat = anthropic.AnthropicResponseToChatResponse(body, model)
	case converter.FormatResponses:
		chat = responses.ResponsesToChatResponse(body)
	}
	return chat
}
func (h *Handler) attempt(w http.ResponseWriter, r *http.Request, cfg *config.ProxyConfig, pc *config.ProviderConfig, body map[string]any, source converter.FormatName, endpoint string, stream bool, requestID, clientIP string, currentUser *interceptor.CurrentUser) (int, map[string]any, error, string, string) {
	target := providerFormat(pc.Provider)
	merged := mergeDefaultParams(body, pc.DefaultParams)
	upBody := toProviderBody(merged, source, target)
	upBody["model"] = pc.RealModel
	endpoint = providerEndpoint(target)
	apiKey, err := config.ResolveAPIKey(pc.APIKey, cfg.ApiKeys)
	if err != nil {
		return 400, nil, err, "", ""
	}
	p := provider.GetProvider(pc)
	url := p.BuildURL(pc, endpoint)
	headers := p.BuildHeaders(apiKey)
	up := &interceptor.UpstreamRequest{URL: url, Headers: headers, Body: upBody}
	requestHeaders := map[string]string{}
	for k, v := range r.Header {
		if len(v) > 0 {
			requestHeaders[k] = v[0]
		}
	}
	ictx := &interceptor.Context{Provider: pc, RequestHeaders: requestHeaders, RequestPath: r.URL.Path, ClientIP: clientIP, RequestID: requestID, CustomModel: pc.CustomModel, CurrentUser: currentUser, ModelGroup: "", Stream: stream}
	if h.deps.Interceptors != nil {
		up, err = h.deps.Interceptors.Execute(up, ictx)
		if err != nil {
			if pe, ok := err.(*interceptor.PermissionError); ok {
				return 403, nil, pe, "", ""
			}
			return 403, nil, err, "", ""
		}
	}
	b, _ := json.Marshal(up.Body)
	ctx, cancel := context.WithTimeout(r.Context(), h.deps.Timeout)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, up.URL, bytes.NewReader(b))
	if err != nil {
		return 502, nil, err, "", ""
	}
	for k, v := range up.Headers {
		req.Header.Set(k, v)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return 502, nil, err, "", ""
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		msg, _ := io.ReadAll(resp.Body)
		return resp.StatusCode, nil, fmt.Errorf("upstream error: %s", string(msg)), "", ""
	}
	if stream {
		contentType := resp.Header.Get("Content-Type")
		w.Header().Set("Content-Type", contentType)
		if contentType == "" {
			w.Header().Set("Content-Type", "text/event-stream")
		}
		w.Header().Set("Cache-Control", "no-cache")
		writeStream(w, resp.Body, source, target, requestID, pc.CustomModel)
		return resp.StatusCode, nil, nil, pc.RealModel, ""
	}
	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return 502, nil, err, "", ""
	}
	var out map[string]any
	if json.Unmarshal(raw, &out) != nil {
		return 502, nil, fmt.Errorf("invalid upstream JSON"), "", ""
	}
	result := fromProviderBody(out, target, source, pc.CustomModel)
	payload, _ := json.Marshal(result)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)
	w.Write(payload)
	return 200, result, nil, pc.RealModel, ""
}
func providerEndpoint(format converter.FormatName) string {
	switch format {
	case converter.FormatAnthropic:
		return "messages"
	case converter.FormatResponses:
		return "responses"
	default:
		return "chat"
	}
}
func writeStream(w http.ResponseWriter, src io.Reader, source, target converter.FormatName, requestID, model string) {
	scanner := bufio.NewScanner(src)
	scanner.Buffer(make([]byte, 1024*1024), 10*1024*1024)
	var oaiState *anthropic.OAIStreamState
	var anthState *anthropic.AnthStreamState
	var responsesDown *responses.ResponsesDownstreamStream
	if source == converter.FormatChat && target == converter.FormatAnthropic {
		oaiState = anthropic.NewOAIStreamState()
	}
	if source == converter.FormatAnthropic && target == converter.FormatChat {
		anthState = anthropic.NewAnthStreamState()
	}
	if source == converter.FormatChat && target == converter.FormatResponses {
		responsesDown = responses.NewResponsesDownstreamStream()
	}
	first := time.Now()
	var last time.Time
	tokens := 0
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			if data == "[DONE]" {
				if target == converter.FormatResponses && responsesDown != nil {
					for _, s := range responsesDown.Flush() {
						io.WriteString(w, s)
					}
				}
				io.WriteString(w, "data: [DONE]\n\n")
				continue
			}
			var event map[string]any
			if json.Unmarshal([]byte(data), &event) == nil {
				if oaiState != nil {
					for _, e := range anthropic.OAIChunkToAnthropicEvents(event, oaiState) {
						io.WriteString(w, anthropic.FormatAnthropicEventToSSE(asMap(e)))
					}
					if last.IsZero() {
						last = time.Now()
					}
					continue
				}
				if anthState != nil {
					if c := anthropic.AnthEventToOAIChunk(event, requestID, model, anthState); c != nil {
						b, _ := json.Marshal(c)
						io.WriteString(w, "data: "+string(b)+"\n\n")
					}
					if last.IsZero() {
						last = time.Now()
					}
					continue
				}
				if responsesDown != nil {
					for _, s := range responsesDown.Transform(event) {
						io.WriteString(w, s)
					}
					if last.IsZero() {
						last = time.Now()
					}
					continue
				}
			}
		}
		io.WriteString(w, line+"\n")
	}
	_ = first
	_ = last
	_ = tokens
	_ = store.RequestLogEntry{}
}
func asMap(v any) map[string]any { m, _ := v.(map[string]any); return m }
func writeError(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]any{"error": map[string]any{"message": msg, "type": "error"}})
}
func RegisterRoutes(mux *http.ServeMux, deps Dependencies) {
	h := &Handler{deps: deps}
	for _, p := range []string{"/chat/completions", "/v1/chat/completions", "/v1/v1/chat/completions", "/messages", "/v1/messages", "/v1/v1/messages", "/responses", "/v1/responses"} {
		mux.Handle("POST "+p, h)
	}
	mux.HandleFunc("GET /models", func(w http.ResponseWriter, r *http.Request) { writeModels(w, deps.ConfigGetter()) })
	mux.HandleFunc("GET /v1/models", func(w http.ResponseWriter, r *http.Request) { writeModels(w, deps.ConfigGetter()) })
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})
}
func writeModels(w http.ResponseWriter, cfg *config.ProxyConfig) {
	data := []map[string]any{}
	if cfg != nil {
		for _, m := range cfg.Models {
			data = append(data, map[string]any{"id": m.CustomModel, "object": "model", "owned_by": string(m.Provider), "created": 0})
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"object": "list", "data": data})
}
