# Cloudflare Worker Realtime Visitors (Durable Objects)

This setup gives an approximate "online now" counter plus total unique visitors for a static GitHub Pages site.

## What is Wrangler?

`wrangler` is Cloudflare's official CLI tool used to:

- authenticate your Cloudflare account
- create and manage Worker resources (like Durable Objects)
- deploy Worker code to Cloudflare

## Install Wrangler

Prerequisite: Node.js `18+` installed.

Install globally:

```bash
npm install -g wrangler
```

Verify installation:

```bash
wrangler --version
```

Login to Cloudflare:

```bash
wrangler login
```

## 1) Configure `wrangler.toml`

```toml
name = "bdiptv-visitors"
main = "./visitor-counter-worker.js"
compatibility_date = "2026-02-25"

[durable_objects]
bindings = [
  { name = "VISITOR_COUNTER", class_name = "VisitorCounterDO" }
]

[[migrations]]
tag = "v1"
new_sqlite_classes = ["VisitorCounterDO"]

[vars]
ALLOWED_ORIGIN = "your-streaming-url"
VISITOR_TTL_SECONDS = "180"
```

Use your real production origin (or `*` while testing).

## 2) Deploy worker

```bash
wrangler deploy
```

After deploy, copy your worker URL, e.g.:

`https://bdiptv-visitors.<subdomain>.workers.dev`

## 3) Configure frontend

For local development, create `.env.local` in project root:

```bash
NEXT_PUBLIC_VISITORS_API=https://bdiptv-visitors.<subdomain>.workers.dev
```

For GitHub Pages deploy, set the same variable in your GitHub Actions build environment:

```bash
NEXT_PUBLIC_VISITORS_API=https://bdiptv-visitors.<subdomain>.workers.dev
```

The frontend now starts sending:

- `POST /heartbeat` every ~30s
- `GET /online` every ~20s

`GET /online` response:

```json
{
  "online": 34,
  "totalVisitors": 1250,
  "windowSeconds": 180
}
```

`POST /heartbeat` response (example):

```json
{
  "ok": true,
  "totalVisitors": 1250
}
```

## Notes

- Count is approximate (tabs, connectivity, ad blockers, TTL window).
- `totalVisitors` is tracked by the Durable Object and persisted via DO storage.
- Online window is controlled by `VISITOR_TTL_SECONDS` (default 180 seconds).
- Every `wrangler deploy` publishes the latest Worker version immediately.
