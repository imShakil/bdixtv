'use client';

import { useRef, useState } from 'react';
import { useEffect } from 'react';

export default function AdSlot({ slot, adsConfig, className = '' }) {
  const slotConfig = adsConfig?.slots?.[slot];
  const isAdsterra = slotConfig?.provider === 'adsterra';
  const [isAdsterraLoaded, setIsAdsterraLoaded] = useState(false);
  const [isAdsterraBlocked, setIsAdsterraBlocked] = useState(false);
  const [isStandardLoaded, setIsStandardLoaded] = useState(false);
  const [isStandardBlocked, setIsStandardBlocked] = useState(false);
  const slotContainerRef = useRef(null);
  const standardInsRef = useRef(null);

  useEffect(() => {
    if (!slotConfig?.slot && !isAdsterra) {
      return undefined;
    }

    if (isAdsterra) {
      const key = slotConfig?.key;
      if (!key) {
        return undefined;
      }

      const container = slotContainerRef.current;
      if (!container) {
        return undefined;
      }

      let isCancelled = false;
      setIsAdsterraLoaded(false);
      setIsAdsterraBlocked(false);

      const win = window;
      win.__adsterraQueue = (win.__adsterraQueue || Promise.resolve()).then(() => (
        new Promise((resolve) => {
          if (isCancelled) {
            resolve();
            return;
          }

          container.innerHTML = '';
          win.atOptions = {
            key,
            format: slotConfig.format || 'iframe',
            height: Number(slotConfig.height || 90),
            width: Number(slotConfig.width || 728),
            params: {}
          };

          const invokeScript = document.createElement('script');
          invokeScript.type = 'text/javascript';
          invokeScript.src = slotConfig.src || `https://ceasepancreas.com/${key}/invoke.js`;
          invokeScript.async = true;
          invokeScript.onload = () => resolve();
          invokeScript.onerror = () => {
            if (!isCancelled) {
              setIsAdsterraBlocked(true);
            }
            resolve();
          };
          container.appendChild(invokeScript);

          const observer = new MutationObserver(() => {
            if (container.querySelector('iframe')) {
              if (!isCancelled) {
                setIsAdsterraLoaded(true);
              }
              observer.disconnect();
            }
          });
          observer.observe(container, { childList: true, subtree: true });

          window.setTimeout(() => {
            observer.disconnect();
            if (!container.querySelector('iframe') && !isCancelled) {
              setIsAdsterraBlocked(true);
            }
          }, 3000);
        })
      ));

      return () => {
        isCancelled = true;
        container.innerHTML = '';
      };
    }

    const ins = standardInsRef.current;
    if (!ins) {
      return undefined;
    }

    let isCancelled = false;
    setIsStandardLoaded(false);
    setIsStandardBlocked(false);

    const observer = new MutationObserver(() => {
      if (ins.querySelector('iframe')) {
        if (!isCancelled) {
          setIsStandardLoaded(true);
        }
        observer.disconnect();
      }
    });
    observer.observe(ins, { childList: true, subtree: true });

    const timeoutId = window.setTimeout(() => {
      observer.disconnect();
      if (!ins.querySelector('iframe') && !isCancelled) {
        setIsStandardBlocked(true);
      }
    }, 4000);

    try {
      if (window.adsbygoogle && slotConfig?.slot) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('[AdSlot] Error:', slot, err);
      setIsStandardBlocked(true);
    }
    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [adsConfig?.adClient, isAdsterra, slot, slotConfig]);

  if (!slotConfig || (!slotConfig.slot && !isAdsterra)) return null;

  if (isAdsterra) {
    if (isAdsterraBlocked) {
      return null;
    }
    const visibilityClass = isAdsterraLoaded ? '' : 'hidden';
    const wrapperClass = slotConfig.hideOnMobile
      ? `hidden md:flex ${visibilityClass} ${className}`
      : `${visibilityClass} ${className}`;
    return (
      <div className={`flex items-center justify-center overflow-hidden ${wrapperClass}`}>
        <div ref={slotContainerRef} />
      </div>
    );
  }

  const adClient = adsConfig?.adClient || 'ca-pub-2449944472030683';
  if (isStandardBlocked) {
    return null;
  }
  const standardVisibilityClass = isStandardLoaded ? '' : 'hidden';

  // In-feed ad (fluid layout)
  if (slotConfig.format === 'fluid') {
    return (
      <div className={`${standardVisibilityClass} ${className}`}>
        <ins
          ref={standardInsRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="fluid"
          data-ad-layout-key={slotConfig.layoutKey}
          data-ad-client={adClient}
          data-ad-slot={slotConfig.slot}
        />
      </div>
    );
  }

  const isRectangle = slotConfig?.size === '300x250';
  const standardStyle = isRectangle
    ? { display: 'inline-block', width: '300px', maxWidth: '100%', minHeight: '250px' }
    : { display: 'block', width: '100%', maxWidth: '728px', minHeight: '50px' };

  // Standard ads
  return (
    <div className={`flex items-center justify-center overflow-hidden ${standardVisibilityClass} ${className}`}>
      <ins
        ref={standardInsRef}
        className="adsbygoogle"
        style={standardStyle}
        data-ad-client={adClient}
        data-ad-slot={slotConfig.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
