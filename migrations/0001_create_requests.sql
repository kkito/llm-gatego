CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL UNIQUE,
  timestamp TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  user_name TEXT,
  client_ip TEXT,
  custom_model TEXT,
  real_model TEXT,
  provider TEXT,
  model_group TEXT,
  actual_model TEXT,
  endpoint TEXT,
  status_code INTEGER,
  duration_ms INTEGER,
  is_streaming INTEGER,
  ttft_ms INTEGER,
  tps REAL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cached_tokens INTEGER,
  error_message TEXT,
  error_type TEXT,
  response_metadata TEXT
);
CREATE INDEX IF NOT EXISTS idx_timestamp ON requests(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_name ON requests(user_name);
CREATE INDEX IF NOT EXISTS idx_client_ip ON requests(client_ip);
CREATE INDEX IF NOT EXISTS idx_custom_model ON requests(custom_model);
CREATE INDEX IF NOT EXISTS idx_created_at ON requests(created_at);
