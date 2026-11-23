# llm-gatego 数据模型（ER 图）

## SQLite `requests` 表

```mermaid
erDiagram
    requests {
        INTEGER id PK "自增主键"
        TEXT request_id UK "请求唯一 ID (去重键)"
        TEXT timestamp "ISO 时间字符串"
        INTEGER created_at "Unix 毫秒 (周期查询用)"
        TEXT user_name "用户名 (可空)"
        TEXT client_ip "客户端 IP (X-Forwarded-For)"
        TEXT custom_model "用户请求的模型名"
        TEXT real_model "实际配置的模型名"
        TEXT provider "供应商类型"
        TEXT model_group "模型组名 (可空)"
        TEXT actual_model "实际使用的模型"
        TEXT endpoint "API 端点"
        INTEGER status_code "HTTP 状态码"
        INTEGER duration_ms "耗时毫秒"
        INTEGER is_streaming "是否流式 0/1"
        INTEGER ttft_ms "首 token 时间 (可空)"
        REAL tps "tokens/秒 (可空)"
        INTEGER prompt_tokens "输入 token"
        INTEGER completion_tokens "输出 token"
        INTEGER total_tokens "总 token"
        INTEGER cached_tokens "缓存 token"
        TEXT error_message "错误消息 (可空)"
        TEXT error_type "错误类型 (可空)"
        TEXT response_metadata "响应元数据 JSON"
    }

    schema_migrations {
        INTEGER version PK "迁移版本号"
        TEXT applied_at "应用时间"
    }

    requests ||--o{ schema_migrations : "迁移演化"
```

## 索引

| 索引名 | 列 | 用途 |
|---|---|---|
| `idx_timestamp` | timestamp | 按日期范围查询 |
| `idx_user_name` | user_name | 按用户过滤统计 |
| `idx_client_ip` | client_ip | 按 IP 过滤统计 |
| `idx_custom_model` | custom_model | 按模型聚合用量 / 限流 |
| `idx_created_at` | created_at | 周期限流范围查询（day/week/month/hours） |

## 迁移历史

与原项目 `src/lib/schema.ts` 完全一致：单文件 `0001_create_requests.sql` **一次性建表 24 列 + 5 索引**（含 `client_ip`、`ttft_ms`、`tps`），无增量 ALTER 迁移。

| 版本 | 文件 | 变更 |
|---|---|---|
| 1 | 0001_create_requests.sql | 建表 24 列 + 5 索引（含 client_ip/ttft_ms/tps） |

## 写入语义

- RequestLogger 100ms 批量 flush，按 `request_id` **保留最后一条**（`INSERT ... ON CONFLICT(request_id) DO UPDATE`），对齐原 TS 版 map 去重。
- 流式请求的 TTFT/TPS 在流结束时补写，覆盖早期的不完整条目。
- `CleanupTimer` 每小时删除 `created_at < now - 90d` 的记录。
