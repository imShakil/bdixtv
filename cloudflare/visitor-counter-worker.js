/**
 * Cloudflare Worker (KV-backed) for approximate live visitor counting.
 *
 * Endpoints:
 * - POST /heartbeat  { id: string }
 * - GET  /online     -> { online: number, totalVisitors: number, windowSeconds: number }
 *
 * Required binding:
 * - VISITORS (KV namespace)
 *
 * Optional vars:
 * - ALLOWED_ORIGIN (default "*")
 * - VISITOR_TTL_SECONDS (default 180)
 */

function corsHeaders(env) {
  return {
    'access-control-allow-origin': env.ALLOWED_ORIGIN || '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-type': 'application/json; charset=utf-8'
  };
}

function json(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(env)
  });
}

const ONLINE_PREFIX = 'v:';
const SEEN_PREFIX = 'seen:';
const TOTAL_VISITORS_KEY = 'stats:total_visitors';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const ttlSeconds = Number(env.VISITOR_TTL_SECONDS || 180);

    if (!env?.VISITORS) {
      return json({ ok: false, error: 'KV binding VISITORS is missing' }, 500, env);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (path === '/heartbeat' && request.method === 'POST') {
      let body;

      try {
        body = await request.json();
      } catch {
        return json({ ok: false, error: 'invalid request body' }, 400, env);
      }

      const id = String(body?.id || '').trim();

      if (!id || id.length > 128) {
        return json({ ok: false, error: 'invalid visitor id' }, 400, env);
      }

      try {
        await env.VISITORS.put(`${ONLINE_PREFIX}${id}`, '1', { expirationTtl: ttlSeconds });

        const seenKey = `${SEEN_PREFIX}${id}`;
        const seenBefore = await env.VISITORS.get(seenKey);

        if (!seenBefore) {
          await env.VISITORS.put(seenKey, '1');

          // Approximate increment for total visitors (KV is eventually consistent).
          const rawTotal = await env.VISITORS.get(TOTAL_VISITORS_KEY);
          const currentTotal = Number.parseInt(rawTotal || '0', 10);
          const nextTotal = Number.isFinite(currentTotal) ? currentTotal + 1 : 1;
          await env.VISITORS.put(TOTAL_VISITORS_KEY, String(nextTotal));
        }

        const totalVisitors = Number.parseInt((await env.VISITORS.get(TOTAL_VISITORS_KEY)) || '0', 10);
        return json({ ok: true, totalVisitors: Number.isFinite(totalVisitors) ? totalVisitors : 0 }, 200, env);
      } catch {
        return json({ ok: false, error: 'failed to write visitor data' }, 500, env);
      }
    }

    if (path === '/online' && request.method === 'GET') {
      let cursor = undefined;
      let online = 0;
      let pages = 0;

      // Safety cap to avoid unbounded loops on very large keyspaces.
      while (pages < 50) {
        const page = await env.VISITORS.list({ prefix: ONLINE_PREFIX, cursor, limit: 1000 });
        online += page.keys.length;
        pages += 1;

        if (page.list_complete) {
          break;
        }

        cursor = page.cursor;
      }

      const rawTotalVisitors = await env.VISITORS.get(TOTAL_VISITORS_KEY);
      const totalVisitors = Number.parseInt(rawTotalVisitors || '0', 10);

      return json(
        {
          online,
          totalVisitors: Number.isFinite(totalVisitors) ? totalVisitors : 0,
          windowSeconds: ttlSeconds
        },
        200,
        env
      );
    }

    return json({ ok: false, error: 'not found' }, 404, env);
  }
};
