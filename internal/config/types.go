package config

// ProviderType matches src/config.ts ProviderType.
type ProviderType string

const (
	ProviderOpenAI      ProviderType = "openai"
	ProviderAnthropic   ProviderType = "anthropic"
	ProviderResponseAPI ProviderType = "response-api"
)

type LimitType string

const (
	LimitRequests    LimitType = "requests"
	LimitInputTokens LimitType = "input_tokens"
	LimitCost        LimitType = "cost"
)

type LimitPeriod string

const (
	PeriodDay   LimitPeriod = "day"
	PeriodHours LimitPeriod = "hours"
	PeriodWeek  LimitPeriod = "week"
	PeriodMonth LimitPeriod = "month"
)

// ModelLimit matches src/config.ts ModelLimit.
type ModelLimit struct {
	Type        LimitType   `json:"type"`
	Period      LimitPeriod `json:"period"`
	PeriodValue *int        `json:"periodValue,omitempty"`
	Max         float64     `json:"max"`
}

// ApiKey matches src/config.ts ApiKey.
type ApiKey struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Key       string `json:"key"`
	CreatedAt int64  `json:"createdAt"`
	UpdatedAt int64  `json:"updatedAt"`
}

// ProviderConfig matches src/config.ts ProviderConfig.
type ProviderConfig struct {
	CustomModel      string         `json:"customModel"`
	RealModel        string         `json:"realModel"`
	APIKey           string         `json:"apiKey"`
	BaseURL          string         `json:"baseUrl"`
	Provider         ProviderType   `json:"provider"`
	Desc             string         `json:"desc,omitempty"`
	InputPricePer1M  *float64       `json:"inputPricePer1M,omitempty"`
	OutputPricePer1M *float64       `json:"outputPricePer1M,omitempty"`
	CachedPricePer1M *float64       `json:"cachedPricePer1M,omitempty"`
	Limits           []ModelLimit   `json:"limits,omitempty"`
	Hidden           bool           `json:"hidden,omitempty"`
	MaxContextLength int            `json:"maxContextLength"`
	DefaultParams    map[string]any `json:"defaultParams,omitempty"`
	Proxy            string         `json:"proxy,omitempty"`
}

// UserApiKey matches src/config.ts UserApiKey.
type UserApiKey struct {
	Name          string   `json:"name"`
	APIKey        string   `json:"apikey"`
	Desc          string   `json:"desc,omitempty"`
	AllowedModels []string `json:"allowedModels,omitempty"`
}

// ModelGroup matches src/config.ts ModelGroup.
type ModelGroup struct {
	Name   string   `json:"name"`
	Models []string `json:"models"`
	Desc   string   `json:"desc,omitempty"`
}

// PrivacySettings matches src/config.ts PrivacySettings.
type PrivacySettings struct {
	Enabled           bool   `json:"enabled"`
	StripUserField    bool   `json:"stripUserField"`
	SanitizeFilePaths bool   `json:"sanitizeFilePaths"`
	PathPlaceholder   string `json:"pathPlaceholder"`
	WhitelistFilter   bool   `json:"whitelistFilter"`
}

// UiSettings matches src/config.ts UiSettings.
type UiSettings struct {
	Enabled              bool   `json:"enabled,omitempty"`
	AnnouncementMarkdown string `json:"announcementMarkdown,omitempty"`
}

// ProxyConfig matches src/config.ts ProxyConfig.
type ProxyConfig struct {
	Models           []ProviderConfig `json:"models"`
	ModelGroups      []ModelGroup     `json:"modelGroups,omitempty"`
	AdminPassword    string           `json:"adminPassword,omitempty"`
	ApiKeys          []ApiKey         `json:"apiKeys,omitempty"`
	UserApiKeys      []UserApiKey     `json:"userApiKeys,omitempty"`
	PrivacySettings  *PrivacySettings `json:"privacySettings,omitempty"`
	UiSettings       *UiSettings      `json:"uiSettings,omitempty"`
	DetailLogEnabled bool             `json:"detailLogEnabled,omitempty"`
}
