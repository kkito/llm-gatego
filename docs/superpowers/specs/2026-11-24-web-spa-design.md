# Web SPA Conversion Design

## Goal

Convert the Lit-based frontend from a multi-page application (full document
navigation + native form POST) into a true single-page application:

- URL changes via `history.pushState` / `popstate`, no full reload.
- Internal links are intercepted and routed client-side.
- Write operations use `fetch` against JSON APIs, not native form POSTs.
- API responses may carry a `redirect` hint; frontend navigates accordingly.
- Preserve all existing URLs, page components, visual style, and Chinese copy.

Backend changes are allowed but limited to extending the JSON response envelope
with an optional `redirect` field. No new API endpoints are required.

## Decisions

- Router: hand-written lightweight module, no router library.
- Forms: intercept `@submit`, serialize values, POST JSON to `/api/admin/*`.
- Success navigation: central helper honors `redirect` from API; falls back to
  refresh current page. Login keeps explicit navigation by context.
- Scoped to the Lit frontend branch (`lit-web-migration`), not the Fluent
  experiment.
- Keep legacy `/admin/*` form bridges for compatibility; frontend no longer
  depends on them.

## Router

New `web/src/router.ts` exposes:

- `currentPath(): string`
- `navigate(path: string, options?: { replace?: boolean }): void`
- `subscribe(listener: (path: string) => void): () => void`
- `startLinkInterception(root: Document): void`

Link interception only handles:
- same origin
- no `target`, `download`, `rel=external`
- no ctrl/meta/shift/alt
- HTTP(S) URLs only

`gw-app` subscribes to router and treats `path` as reactive state. On change it
mounts the matching page component and passes `path` / `title` / route params.

## API helper

`web/src/api.ts` gains:

- `postJSON<T>(url, body): Promise<ApiEnvelope<T>>`
- `formToObject(form): Record<string, any>` handling inputs, selects,
  checkboxes, and `multiple` selects.

`ApiEnvelope<T>` is extended to include optional `redirect?: string`.

## Backend

Extend `Envelope[T]` in `internal/server/api.go`:

```go
type Envelope[T any] struct {
    OK       bool      `json:"ok"`
    Data     *T        `json:"data,omitempty"`
    Error    *APIError `json:"error,omitempty"`
    Redirect string    `json:"redirect,omitempty"`
}
```

Add `okJSONRedirect(w, data, redirect)` helper. Use it for write handlers where
the old form flow used to redirect to a page:

- models add/edit/delete/copy/move/toggle -> `/admin/models`
- model-groups add/edit/delete/add-model/remove-model/move-model -> `/admin/model-groups`
- api-keys add/edit/delete -> `/admin/api-keys`
- users add/edit/delete/toggle -> `/admin/users`
- privacy/password -> current page (or omit redirect)
- model limits add/edit/delete -> current limits page
- admin login -> `/admin/models`, user login -> `/user/main`

Existing clients ignore the extra field.

## Page changes

All page components:
- keep `GwPage` / `GWPage.load()` data loading
- replace native form submits with `@submit=${this.onSubmit}` handlers
- use `postJSON()` and `router.navigate()` via a shared `afterWrite()` helper
- GET filter forms (`stats`, `user-stats`) use `navigate()` with query string

Login page posts JSON to `/api/admin/login` or `/api/user/login`, then navigates
using the returned redirect.

## Tests

- `web/tests/router.test.ts`: navigate/popstate/link interception.
- `web/tests/appRouting.test.ts`: route switching on URL change.
- `web/tests/views.test.ts` / DOM tests: forms are SPA handlers, no native POST actions.
- `web/tests/indexBootstrap.test.ts`: still verifies real bundle render.
- Go tests for `Envelope.redirect` serialization.

## Out of scope

- No Go route restructuring, no new APIs.
- No Fluent experiment changes.
- No authentication flow redesign beyond SPA navigation.
