'use client';

import { useEffect } from 'react';

export default function AdSlot({ slot, adsConfig, className = '' }) {
  const slotConfig = adsConfig?.slots?.[slot];

  useEffect(() => {
    try {
      if (window.adsbygoogle && slotConfig?.slot) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('[AdSlot] Error:', slot, err);
    }
  }, [slot, slotConfig]);

  if (!slotConfig?.slot) return null;

  // In-feed ad (fluid layout)
  if (slotConfig.format === 'fluid') {
    return (
      <div className={className}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="fluid"
          data-ad-layout-key={slotConfig.layoutKey}
          data-ad-client="ca-pub-2449944472030683"
          data-ad-slot={slotConfig.slot}
        />
      </div>
    );
  }

  // Standard ads
  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', maxWidth: '728px', minHeight: '50px' }}
        data-ad-client="ca-pub-2449944472030683"
        data-ad-slot={slotConfig.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
