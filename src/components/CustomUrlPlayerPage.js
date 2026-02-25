'use client';

import { useEffect, useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import AdSlot from '@/components/AdSlot';
import LiveVisitorCount from '@/components/LiveVisitorCount';
import { isHttpUrl, normalizeIframeSource } from '@/utils/sourceUtils';
import { logEvent } from '@/utils/telemetry';

function resolveType(url, selectedType) {
  if (selectedType !== 'auto') {
    return selectedType;
  }

  const lowered = url.toLowerCase();
  if (lowered.includes('.m3u8')) {
    return 'm3u8';
  }

  if (lowered.includes('<iframe') || lowered.includes('youtube.com/embed')) {
    return 'iframe';
  }

  return 'custom';
}

export default function CustomUrlPlayerPage() {
  const [customUrl, setCustomUrl] = useState('');
  const [customType, setCustomType] = useState('auto');
  const [customError, setCustomError] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [adsConfig, setAdsConfig] = useState(null);

  const showAds = adsConfig?.enabled || false;

  useEffect(() => {
    // Load ads config
    fetch('/data/ads.json')
      .then(res => res.json())
      .then(data => setAdsConfig(data))
      .catch(() => setAdsConfig({ enabled: false }));
  }, []);

  const handlePlayCustomUrl = () => {
    const value = customUrl.trim();
    if (!value) {
      setCustomError('Enter a stream URL first.');
      return;
    }

    const resolvedType = resolveType(value, customType);

    if (resolvedType === 'iframe') {
      const iframeSrc = normalizeIframeSource(value);
      if (!iframeSrc) {
        setCustomError('Invalid iframe source.');
        return;
      }
    } else if (!isHttpUrl(value)) {
      setCustomError('Enter a valid HTTP/HTTPS URL.');
      return;
    }

    setSelectedChannel({
      id: `custom-url-${Date.now()}`,
      name: 'Custom URL Stream',
      logo: '',
      type: resolvedType,
      source: value,
      category: 'User Stream',
      language: '',
      origin: 'custom'
    });

    setCustomError('');
    logEvent('custom_url_played', { type: resolvedType });
  };

  return (
    <main>
      <div className="space-y-5 md:space-y-7">
        <section className="space-y-3 md:space-y-4">
          <div className="space-y-4 rounded-xl border border-steel/20 bg-white/80 px-4 py-3 shadow-card">
            <div className="grid gap-2.5 md:grid-cols-[1fr_auto_auto] md:items-center">
              <input
                value={customUrl}
                onChange={(event) => setCustomUrl(event.target.value)}
                placeholder="Paste stream URL (m3u8 / iframe / mp4)"
                className="rounded-lg border border-steel/20 bg-white px-3 py-2.5 text-sm outline-none"
              />
              <select
                value={customType}
                onChange={(event) => setCustomType(event.target.value)}
                className="rounded-lg border border-steel/20 bg-white px-3 py-2.5 text-sm outline-none"
              >
                <option value="auto">Auto type</option>
                <option value="m3u8">M3U8</option>
                <option value="iframe">Iframe</option>
                <option value="custom">Custom URL</option>
              </select>
              <button
                type="button"
                onClick={handlePlayCustomUrl}
                className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-steel"
              >
                Play URL
              </button>
            </div>
            {customError ? <p className="text-xs text-rose-700">{customError}</p> : null}
          </div>

          {/* Ad Slot 1: Header Banner */}
          {showAds && adsConfig?.slots?.header?.enabled && <AdSlot slot="header" adsConfig={adsConfig} />}

          <div className="grid gap-3 md:gap-4 lg:grid-cols-[minmax(0,2.3fr)_minmax(0px,1fr)]">
            <div>
              <VideoPlayer channel={selectedChannel} autoplay={Boolean(selectedChannel)} />
            </div>

            <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-steel/20 bg-white/85 p-4 shadow-card md:p-5">
              <div className="rounded-xl border border-sea/30 bg-cyan-50 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-steel/80">Now Playing</p>
                  <div className="flex items-center gap-1.5">
                    {selectedChannel ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-rose-700">
                        <span className="relative inline-flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
                        </span>
                        Live
                      </span>
                    ) : null}
                    <span className="inline-flex rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold tracking-[0.02em] text-steel">
                      <LiveVisitorCount compact />
                    </span>
                  </div>
                </div>
                <p className="truncate pt-1 text-base font-semibold text-ink">
                  {selectedChannel ? selectedChannel.name : 'No stream loaded'}
                </p>
                {selectedChannel ? (
                  <p className="truncate text-xs text-steel">
                    {selectedChannel.type.toUpperCase()} stream
                  </p>
                ) : (
                  <p className="truncate text-xs text-steel">Enter a URL to start streaming.</p>
                )}

              </div>
              {/* Ad Slot 2: Sidebar Banner */}
              {showAds && adsConfig?.slots?.sidebar?.enabled && <AdSlot slot="sidebar" adsConfig={adsConfig} />}
            </div>
          </div>
        </section>
      </div>
      {/* Ad Slot 3: Below Player */}
      {showAds && adsConfig?.slots?.belowPlayer?.enabled && <AdSlot slot="belowPlayer" adsConfig={adsConfig} />}
    </main>
  );
}
