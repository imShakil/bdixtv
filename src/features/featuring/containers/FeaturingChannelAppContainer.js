'use client';

import ChannelBrowser from '@/components/ChannelBrowser';
import LoadStatePanel from '@/components/LoadStatePanel';
import useAdsConfig from '@/hooks/useAdsConfig';
import useCachedChannelLoader from '@/hooks/useCachedChannelLoader';
import { loadCustomChannels } from '@/utils/channels';

const CACHE_KEY = 'bdiptv_featuring_channels_cache';
const FEATURED_CACHE_TTL_MS = 5 * 60 * 1000;
const METRIC_CONTEXT = { page: 'featuring' };
const LOG_CONTEXT = { page: 'featuring' };

export default function FeaturingChannelApp() {
  const adsConfig = useAdsConfig();
  const { status, channels, retry } = useCachedChannelLoader({
    cacheKey: CACHE_KEY,
    loadChannels: loadCustomChannels,
    cacheTtlMs: FEATURED_CACHE_TTL_MS,
    metricContext: METRIC_CONTEXT,
    logContext: LOG_CONTEXT,
    getLoadedEventData: (loadedChannels) => ({
      playlistCount: 0,
      customCount: loadedChannels.length
    })
  });

  if (status !== 'ready') {
    return (
      <LoadStatePanel
        status={status}
        onRetry={retry}
        errorMessage="No featured custom channels were found."
      />
    );
  }

  return (
    <main>
      <ChannelBrowser
        channels={channels}
        adsConfig={adsConfig}
        showDailyEvents
      />
    </main>
  );
}
