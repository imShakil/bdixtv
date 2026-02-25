'use client';

import ChannelCard from '@/components/ChannelCard';
import AdSlot from '@/components/AdSlot';

export default function ChannelGrid({ channels, selectedChannel, onSelect, showAds = false, adsConfig }) {
  if (!channels.length) {
    return (
      <div className="rounded-xl border border-dashed border-steel/30 bg-white/70 p-6 text-sm text-steel">
        No channels found for current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {channels.map((channel, index) => (
        <div key={channel.id} className="contents">
          <ChannelCard
            channel={channel}
            isActive={selectedChannel?.id === channel.id}
            onSelect={onSelect}
          />
          {/* Add slot 4: in paging */}
          {showAds && index === 5 ? (
            <div className="col-span-2 xl:col-span-3">
              <AdSlot slot="inFeed" adsConfig={adsConfig} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
