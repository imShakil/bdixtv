'use client';

import { useEffect, useMemo, useState } from 'react';
import { ListFilter, Search } from 'lucide-react';
import ChannelGrid from '@/components/ChannelGrid';
import HeroHeader from '@/components/HeroHeader';
import VideoPlayer from '@/components/VideoPlayer';
import AdSlot from '@/components/AdSlot';
import LiveVisitorCount from '@/components/LiveVisitorCount';
import { logEvent } from '@/utils/telemetry';

const PAGE_SIZE = 12;
const ENABLE_STICKY_PLAYER = false; // Toggle sticky player feature

export default function ChannelBrowser({
  channels,
  adsConfig,
  eyebrow,
  title
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState(channels[0] || null);
  const [page, setPage] = useState(1);
  const [autoplay, setAutoplay] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [showStickyPlayer, setShowStickyPlayer] = useState(true);

  const showAds = adsConfig?.enabled || false;

  const categories = useMemo(() => {
    const values = new Set(channels.map((item) => item.category).filter(Boolean));
    return ['all', ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      const matchedQuery = channel.name.toLowerCase().includes(query.toLowerCase().trim());
      const matchedCategory = category === 'all' || channel.category === category;

      return matchedQuery && matchedCategory;
    });
  }, [channels, query, category]);

  const totalPages = Math.max(1, Math.ceil(filteredChannels.length / PAGE_SIZE));

  const pagedChannels = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredChannels.slice(start, start + PAGE_SIZE);
  }, [filteredChannels, page]);

  useEffect(() => {
    setPage(1);
  }, [query, category]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!selectedChannel && channels.length) {
      setSelectedChannel(channels[0]);
      setAutoplay(false); // Disable autoplay for initial channel
    }
  }, [channels, selectedChannel]);

  const handleSelect = (channel) => {
    setSelectedChannel(channel);
    setAutoplay(true); // Enable autoplay when user clicks
    if (ENABLE_STICKY_PLAYER) {
      setShowStickyPlayer(true);
    }
    logEvent('channel_selected', { id: channel.id, name: channel.name, origin: channel.origin });
  };

  useEffect(() => {
    if (ENABLE_STICKY_PLAYER) {
      const handleScroll = () => {
        setIsSticky(window.scrollY > 400);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const rangeStart = filteredChannels.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = filteredChannels.length ? Math.min(page * PAGE_SIZE, filteredChannels.length) : 0;

  return (
    <div className="space-y-5 md:space-y-7">

      <section className="space-y-3 md:space-y-4">
        <HeroHeader
          totalCount={channels.length}
          eyebrow={eyebrow}
          title={title}
        />

        {/* Ad Slot 1: Header Banner */}
        {showAds && adsConfig?.slots?.header?.enabled && <AdSlot slot="header" adsConfig={adsConfig} />}

        <div className="grid gap-3 md:gap-4 lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <VideoPlayer channel={selectedChannel} autoplay={autoplay} />
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
                {selectedChannel ? selectedChannel.name : 'No channel selected'}
              </p>
              {selectedChannel ? (
                <p className="truncate text-xs text-steel">
                  {selectedChannel.category || 'Uncategorized'}
                  {selectedChannel.language ? ` · ${selectedChannel.language}` : ''}
                </p>
              ) : (
                <p className="truncate text-xs text-steel">Select a channel from the list below.</p>
              )}
            </div>
            {/* Ad Slot 2: Sidebar Banner */}
            {showAds && adsConfig?.slots?.sidebar?.enabled && (
              <div className="min-w-0 overflow-hidden">
                <AdSlot slot="sidebar" adsConfig={adsConfig} />
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="space-y-4 rounded-2xl border border-steel/20 bg-white/90 p-3.5 shadow-card md:p-4">
        <div className="grid gap-2.5 md:gap-3 md:grid-cols-[1.6fr_1fr]">
          <label className="flex items-center gap-2 rounded-lg border border-steel/20 bg-white px-3 py-2.5">
            <Search className="h-4 w-4 text-steel" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search channels"
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-steel/70"
            />
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-steel/20 bg-white px-3 py-2.5">
            <ListFilter className="h-4 w-4 text-steel" />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            >
              {categories.map((entry) => (
                <option key={entry} value={entry}>
                  {entry === 'all' ? 'All categories' : entry}
                </option>
              ))}
            </select>
          </label>

        </div>

        <ChannelGrid
          channels={pagedChannels}
          selectedChannel={selectedChannel}
          onSelect={handleSelect}
          showAds={showAds && adsConfig?.slots?.inFeed?.enabled}
          adsConfig={adsConfig}
        />

        <div className="flex flex-col gap-2 border-t border-steel/15 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-steel">
            Showing {rangeStart}-{rangeEnd} of {filteredChannels.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page === 1}
              className="rounded-lg border border-steel/20 bg-white px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-40"
            >
              Previous
            </button>
            <span className="min-w-20 text-center text-xs font-semibold text-steel">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-steel/20 bg-white px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Ad Slot 3: Below Player */}
      {showAds && adsConfig?.slots?.belowPlayer?.enabled && <AdSlot slot="belowPlayer" adsConfig={adsConfig} />}

      {/* Sticky Player */}
      {ENABLE_STICKY_PLAYER && isSticky && showStickyPlayer && selectedChannel && (
        <div className="fixed bottom-4 right-4 z-50 w-80 overflow-hidden rounded-xl border-2 border-steel/30 bg-black shadow-2xl">
          <div className="relative">
            <button
              onClick={() => setShowStickyPlayer(false)}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <VideoPlayer channel={selectedChannel} autoplay={false} />
          </div>
          <div className="bg-white p-2">
            <p className="truncate text-xs font-semibold text-ink">{selectedChannel.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
