# Cloudflare Worker Realtime Visitors

This setup gives an approximate "online now" counter plus total unique visitors for a static GitHub Pages site.

## What is Wrangler?

`wrangler` is Cloudflare's official CLI tool used to:

- authenticate your Cloudflare account
- create and manage Worker resources (like KV namespaces)
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

## 1) Create KV namespace

```bash
wrangler kv namespace create VISITORS
```

Copy the namespace `id`.

## 2) Create `wrangler.toml`

```toml
name = "bdiptv-visitors"
main = "cloudflare/visitor-counter-worker.js"
compatibility_date = "2026-02-25"

kv_namespaces = [
  { binding = "VISITORS", id = "YOUR_NAMESPACE_ID" }
]

[vars]
ALLOWED_ORIGIN = "your-streaming-url"
VISITOR_TTL_SECONDS = "180"
```

Use your real production origin (or `*` while testing).

## 3) Deploy worker

```bash
wrangler deploy
```

After deploy, copy your worker URL, e.g.:

`https://bdiptv-visitors.<subdomain>.workers.dev`

## 4) Configure frontend

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
- `totalVisitors` is approximate unique visitors (KV-based, eventually consistent).
- Online window is controlled by `VISITOR_TTL_SECONDS` (default 180 seconds).
- Every `wrangler deploy` publishes the latest Worker version immediately.
