'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'bdiptv_visitor_id';
const HEARTBEAT_MS = 30 * 1000;
const POLL_MS = 20 * 1000;

function getOrCreateVisitorId() {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const nextId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(STORAGE_KEY, nextId);
  return nextId;
}

export default function LiveVisitorCount({ compact = false }) {
  const apiBase = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_VISITORS_API || '';
    return raw.replace(/\/$/, '');
  }, []);
  const [online, setOnline] = useState(null);
  const [totalVisitors, setTotalVisitors] = useState(null);

  useEffect(() => {
    if (!apiBase || typeof window === 'undefined') {
      return;
    }

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) {
      return;
    }

    let stopped = false;

    const heartbeat = async () => {
      try {
        await fetch(`${apiBase}/heartbeat`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: visitorId })
        });
      } catch {
        // no-op
      }
    };

    const fetchOnline = async () => {
      try {
        const response = await fetch(`${apiBase}/online`, { cache: 'no-store' });
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        if (!stopped) {
          if (typeof payload?.online === 'number') {
            setOnline(payload.online);
          }
          if (typeof payload?.totalVisitors === 'number') {
            setTotalVisitors(payload.totalVisitors);
          }
        }
      } catch {
        // no-op
      }
    };

    heartbeat();
    fetchOnline();

    const heartbeatTimer = window.setInterval(heartbeat, HEARTBEAT_MS);
    const pollTimer = window.setInterval(fetchOnline, POLL_MS);

    return () => {
      stopped = true;
      window.clearInterval(heartbeatTimer);
      window.clearInterval(pollTimer);
    };
  }, [apiBase]);

  if (!apiBase) {
    return null;
  }

  if (!compact) {
    return (
      <div className="space-y-1 text-xs leading-relaxed md:text-sm">
        <p>Online now: {online ?? '...'}</p>
        <p>Total visitors: {typeof totalVisitors === 'number' ? totalVisitors.toLocaleString() : '...'}</p>
      </div>
    );
  }

  if (online === null) {
    return <span className="text-steel/80">... online</span>;
  }

  return <span className="text-steel/80">{`${online} online`}</span>;
}
