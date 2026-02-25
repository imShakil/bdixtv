'use client';

import { useCallback, useEffect, useState } from 'react';
import ChannelBrowser from '@/components/ChannelBrowser';
import { loadCustomChannels } from '@/utils/channels';
import { logEvent, recordMetric } from '@/utils/telemetry';

const CACHE_KEY = 'bdiptv_featuring_channels_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export default function FeaturingChannelApp() {
  const [status, setStatus] = useState('loading');
  const [channels, setChannels] = useState([]);
  const [adsConfig, setAdsConfig] = useState(null);

  const applyLoadedChannels = useCallback((customChannels) => {
    setChannels(customChannels);
    setStatus('ready');

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          channels: customChannels,
          cachedAt: Date.now()
        })
      );
    }
  }, []);

  const loadAllChannels = useCallback(async (background = false) => {
    const startedAt = performance.now();

    if (!background) {
      setStatus('loading');
    }

    const customChannels = await loadCustomChannels();
    const elapsed = Math.round(performance.now() - startedAt);
    recordMetric('channels_load_ms', elapsed, { background, page: 'featuring' });

    if (!customChannels.length) {
      setStatus('error');
      logEvent('channels_load_failed', { elapsed, page: 'featuring' });
      return;
    }

    applyLoadedChannels(customChannels);
    logEvent('channels_loaded', {
      elapsed,
      playlistCount: 0,
      customCount: customChannels.length,
      total: customChannels.length,
      page: 'featuring'
    });
  }, [applyLoadedChannels]);

  useEffect(() => {
    fetch('/data/ads.json')
      .then(res => res.json())
      .then(data => setAdsConfig(data))
      .catch(() => setAdsConfig({ enabled: false }));

    if (typeof window !== 'undefined') {
      const cached = window.sessionStorage.getItem(CACHE_KEY);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const freshCache =
            typeof parsed.cachedAt === 'number' &&
            Date.now() - parsed.cachedAt <= CACHE_TTL_MS;

          if (freshCache && Array.isArray(parsed.channels) && parsed.channels.length) {
            setChannels(parsed.channels);
            setStatus('ready');
            logEvent('channels_cache_hydrated', { total: parsed.channels.length, page: 'featuring' });
          }
        } catch {
          // ignore corrupted cache
        }
      }
    }

    loadAllChannels(true);
  }, [loadAllChannels]);

  if (status === 'loading') {
    return (
      <main>
        <div className="rounded-2xl border border-steel/20 bg-white/80 p-8 text-center text-steel shadow-card">
          Loading channels...
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main>
        <div className="space-y-4 rounded-2xl border border-amber-300 bg-amber-50 p-8 text-amber-900 shadow-card">
          <h1 className="text-xl font-semibold">Unable to load channels</h1>
          <p className="text-sm">No featured custom channels were found.</p>
          <button
            type="button"
            onClick={() => loadAllChannels(false)}
            className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <ChannelBrowser
        channels={channels}
        adsConfig={adsConfig}
        eyebrow="Featured Only"
        title="Featuring"
      />
    </main>
  );
}
