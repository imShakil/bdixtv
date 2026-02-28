'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { logEvent, recordMetric } from '@/utils/telemetry';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export default function useCachedChannelLoader({
  cacheKey,
  loadChannels,
  metricContext = {},
  logContext = {},
  getLoadedEventData
}) {
  const [status, setStatus] = useState('loading');
  const [channels, setChannels] = useState([]);
  const loadedEventDataRef = useRef(getLoadedEventData);

  useEffect(() => {
    loadedEventDataRef.current = getLoadedEventData;
  }, [getLoadedEventData]);

  const applyLoadedChannels = useCallback((loadedChannels) => {
    setChannels(loadedChannels);
    setStatus('ready');

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          channels: loadedChannels,
          cachedAt: Date.now()
        })
      );
    }
  }, [cacheKey]);

  const loadAllChannels = useCallback(async ({ background = false, preserveOnError = false } = {}) => {
    const startedAt = performance.now();

    if (!background) {
      setStatus('loading');
    }

    try {
      const loadedChannels = await loadChannels();

      const elapsed = Math.round(performance.now() - startedAt);
      recordMetric('channels_load_ms', elapsed, { background, ...metricContext });

      if (!loadedChannels.length) {
        if (!preserveOnError) {
          setStatus('error');
        }
        logEvent('channels_load_failed', { elapsed, background, ...logContext });
        return;
      }

      applyLoadedChannels(loadedChannels);
      logEvent('channels_loaded', {
        elapsed,
        total: loadedChannels.length,
        ...logContext,
        ...(loadedEventDataRef.current ? loadedEventDataRef.current(loadedChannels) : {})
      });
    } catch {
      const elapsed = Math.round(performance.now() - startedAt);
      recordMetric('channels_load_ms', elapsed, { background, failed: true, ...metricContext });
      if (!preserveOnError) {
        setStatus('error');
      }
      logEvent('channels_load_failed', { elapsed, background, ...logContext });
    }
  }, [applyLoadedChannels, loadChannels, logContext, metricContext]);

  useEffect(() => {
    let hasFreshCache = false;
    let hasAnyCachedChannels = false;

    if (typeof window !== 'undefined') {
      const cached = window.sessionStorage.getItem(cacheKey);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const freshCache =
            typeof parsed.cachedAt === 'number' &&
            Date.now() - parsed.cachedAt <= CACHE_TTL_MS;

          if (Array.isArray(parsed.channels) && parsed.channels.length) {
            hasAnyCachedChannels = true;
            setChannels(parsed.channels);
            setStatus('ready');
            logEvent('channels_cache_hydrated', {
              total: parsed.channels.length,
              fresh: freshCache,
              ...logContext
            });
            if (freshCache) {
              hasFreshCache = true;
            }
          }
        } catch {
          // ignore corrupted cache
        }
      }
    }

    if (hasFreshCache) {
      return;
    }

    if (hasAnyCachedChannels) {
      loadAllChannels({ background: true, preserveOnError: true });
      return;
    }

    loadAllChannels({ background: false, preserveOnError: false });
  }, [cacheKey, loadAllChannels, logContext]);

  return {
    status,
    channels,
    retry: () => loadAllChannels({ background: false, preserveOnError: false })
  };
}
