'use client';

import { useEffect, useState } from 'react';

function resolveHostAdsConfig(config, hostname) {
  if (!config || !hostname) {
    return config;
  }

  const hostConfig = config?.hosts?.[hostname];
  if (!hostConfig) {
    return config;
  }

  return {
    ...config,
    ...hostConfig,
    slots: {
      ...(config.slots || {}),
      ...(hostConfig.slots || {})
    }
  };
}

function isNativeRuntime() {
  if (typeof window === 'undefined') {
    return false;
  }
  const cap = window.Capacitor;
  if (!cap) {
    return false;
  }
  if (typeof cap.isNativePlatform === 'function') {
    return cap.isNativePlatform();
  }
  return typeof cap.getPlatform === 'function' ? cap.getPlatform() !== 'web' : cap.platform !== 'web';
}

function resolvePlatformAdsConfig(config) {
  if (!config || !isNativeRuntime()) {
    return config;
  }

  const mobileConfig = config?.mobile;
  if (!mobileConfig) {
    return config;
  }

  return {
    ...config,
    ...mobileConfig,
    slots: {
      ...(config.slots || {}),
      ...(mobileConfig.slots || {})
    }
  };
}

export default function useAdsConfig() {
  const [adsConfig, setAdsConfig] = useState(null);

  useEffect(() => {
    fetch('/data/ads.json')
      .then((res) => res.json())
      .then((data) => {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const hostMergedConfig = resolveHostAdsConfig(data, hostname);
        setAdsConfig(resolvePlatformAdsConfig(hostMergedConfig));
      })
      .catch(() => setAdsConfig({ enabled: false }));
  }, []);

  return adsConfig;
}
