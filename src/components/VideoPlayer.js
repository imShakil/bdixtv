'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import InlineLoader from '@/components/InlineLoader';
import { isLikelyM3uSource, normalizeIframeSource } from '@/utils/sourceUtils';
import { logEvent } from '@/utils/telemetry';

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

const MEDIA_ERROR_TEXT = {
  1: 'Playback was interrupted before the stream finished loading.',
  2: 'The browser hit a network issue while fetching this stream.',
  3: 'The stream data appears corrupted or partially unreadable.',
  4: 'This stream format is not supported by this browser.'
};

function readStatusCode(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  const match = String(value).match(/\b([45]\d{2})\b/);
  return match ? Number(match[1]) : null;
}

function classifyPlayerError({ code = null, status = null, message = '' } = {}) {
  const normalized = String(message || '').toLowerCase();
  const httpStatus = status || readStatusCode(message);

  if (
    httpStatus === 401 ||
    httpStatus === 403 ||
    normalized.includes('forbidden') ||
    normalized.includes('unauthorized') ||
    normalized.includes('geo') ||
    normalized.includes('region') ||
    normalized.includes('country')
  ) {
    return 'region';
  }

  if (
    httpStatus === 404 ||
    httpStatus === 410 ||
    normalized.includes('not found') ||
    normalized.includes('dead') ||
    normalized.includes('manifestloaderror')
  ) {
    return 'broken';
  }

  if (
    normalized.includes('network') ||
    normalized.includes('timeout') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('fragloaderror') ||
    normalized.includes('levelloaderror')
  ) {
    return 'network';
  }

  if (
    code === 4 ||
    normalized.includes('not supported') ||
    normalized.includes('decode') ||
    normalized.includes('demux') ||
    normalized.includes('codec')
  ) {
    return 'unsupported';
  }

  if (
    normalized.includes('cors') ||
    normalized.includes('mixed content') ||
    normalized.includes('cross-origin') ||
    normalized.includes('blocked')
  ) {
    return 'blocked';
  }

  return 'unknown';
}

function buildNativeError(event) {
  const mediaError = event?.target?.error || event?.currentTarget?.error;
  const code = mediaError?.code || null;
  const message = mediaError?.message || MEDIA_ERROR_TEXT[code] || 'Native player failed to load the media stream.';
  return {
    source: 'native',
    code,
    message,
    status: readStatusCode(message)
  };
}

function buildReactPlayerError(error) {
  const message =
    (typeof error === 'string' && error) ||
    error?.message ||
    error?.details ||
    error?.type ||
    'React player reported a playback failure.';

  const status =
    readStatusCode(error?.response?.status) ||
    readStatusCode(error?.status) ||
    readStatusCode(message);

  return {
    source: 'react-player',
    code: null,
    message,
    status
  };
}

function MixedContentWarning({ httpPlayerUrl }) {
  if (!httpPlayerUrl) {
    return null;
  }

  return (
    <div className="absolute right-3 top-3 z-20 max-w-[300px] rounded-lg border border-amber-300 bg-amber-50/95 p-2 text-amber-900 shadow">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="text-xs">
          <p className="font-semibold">HTTP stream on HTTPS page.</p>
          <a
            href={httpPlayerUrl}
            className="mt-1 inline-flex items-center gap-1 font-semibold underline"
          >
            Open HTTP player <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VideoPlayer({ channel, autoplay, isLoading = false }) {
  const isMobile = useMemo(() => {
    if (typeof navigator === 'undefined') {
      return false;
    }

    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }, []);

  const httpPlayerUrl = useMemo(() => {
    if (
      typeof window === 'undefined' ||
      !channel ||
      window.location.protocol !== 'https:' ||
      !channel.source.startsWith('http://')
    ) {
      return null;
    }

    try {
      const target = new URL('/play', window.location.href);
      target.protocol = 'http:';
      target.searchParams.set('url', channel.source);
      target.searchParams.set('type', channel.type || 'auto');
      if (channel.name) {
        target.searchParams.set('name', channel.name);
      }
      return target.toString();
    } catch {
      return window.location.href.replace(/^https:/, 'http:');
    }
  }, [channel]);

  const handlePlayerPlay = (typeLabel) => {
    logEvent('player_play', { name: channel?.name, type: typeLabel });
  };

  const handlePlayerError = (payload) => {
    const reason = classifyPlayerError(payload);
    const message = payload?.message || 'Playback failed.';

    logEvent('player_error', {
      name: channel?.name,
      type: channel?.type,
      mobile: isMobile,
      reason,
      status: payload?.status || undefined,
      code: payload?.code || undefined,
      message
    });
  };

  if (!channel) {
    if (isLoading) {
      return (
        <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-steel/20 bg-white/85 p-10 md:min-h-[420px]">
          <InlineLoader />
        </div>
      );
    }

    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-steel/20 bg-white/85 p-10 text-steel md:min-h-[420px]">
        Select a channel to start streaming.
      </div>
    );
  }

  const insecureStream =
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    channel.source.startsWith('http://');

  const shouldRenderIframe = channel.type === 'iframe' && !isLikelyM3uSource(channel.source);

  if (shouldRenderIframe) {
    const iframeSrc = normalizeIframeSource(channel.source);

    if (!iframeSrc) {
      return (
        <div className="flex min-h-[260px] items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-10 text-amber-900 md:min-h-[420px]">
          <AlertTriangle className="h-5 w-5" />
          Invalid iframe source.
        </div>
      );
    }

    return (
      <div className="relative overflow-hidden rounded-2xl border border-steel/20 bg-slate-900 shadow-card ring-1 ring-black/5">
        {insecureStream ? <MixedContentWarning httpPlayerUrl={httpPlayerUrl} /> : null}
        <div className="aspect-video md:aspect-[16/9]">
          <iframe
            src={iframeSrc}
            title={channel.name}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // Use native video on iOS for better HLS support
  const useNativePlayer = isMobile && channel.type === 'm3u8';

  if (useNativePlayer) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-steel/20 bg-slate-900 shadow-card ring-1 ring-black/5">
        {insecureStream ? <MixedContentWarning httpPlayerUrl={httpPlayerUrl} /> : null}
        <div className="aspect-video md:aspect-[16/9]">
          <video
            key={`native-${channel.source}`}
            src={channel.source}
            controls
            autoPlay={Boolean(autoplay)}
            playsInline
            muted
            preload="metadata"
            className="h-full w-full bg-slate-900"
            onPlay={() => {
              handlePlayerPlay('native');
            }}
            onError={(event) => {
              handlePlayerError(buildNativeError(event));
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-steel/20 bg-slate-900 shadow-card ring-1 ring-black/5">
      {insecureStream ? <MixedContentWarning httpPlayerUrl={httpPlayerUrl} /> : null}
      <div className="aspect-video md:aspect-[16/9]">
        <ReactPlayer
          key={`react-${channel.source}`}
          url={channel.source}
          controls
          playing={Boolean(autoplay)}
          muted={Boolean(autoplay)}
          onPlay={() => {
            handlePlayerPlay(channel.type);
          }}
          onError={(error) => {
            const details = buildReactPlayerError(error);
            console.error('[Player] Error:', details, channel.name);
            handlePlayerError(details);
          }}
          width="100%"
          height="100%"
          playsinline
          config={{
            file: {
              forceHLS: channel.type === 'm3u8',
              hlsOptions: {
                enableWorker: false,
                lowLatencyMode: true,
                backBufferLength: 30,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 0.5,
                highBufferWatchdogPeriod: 2,
                nudgeMaxRetry: 3,
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 3,
                levelLoadingTimeOut: 10000,
                levelLoadingMaxRetry: 3,
                fragLoadingTimeOut: 20000,
                fragLoadingMaxRetry: 3
              },
              attributes: {
                controlsList: 'nodownload',
                playsInline: true,
                'webkit-playsinline': true,
                'x-webkit-airplay': 'allow',
                preload: 'metadata'
              }
            }
          }}
        />
      </div>
    </div>
  );
}
