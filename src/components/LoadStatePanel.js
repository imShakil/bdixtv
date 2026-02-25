'use client';

import { useEffect, useRef, useState } from 'react';

/* ─── Signal bars ─── */
function SignalBars() {
  const bars = [0.5, 0.7, 0.9, 0.65, 0.8, 0.55, 0.75, 1.0, 0.6, 0.85];
  return (
    <div className="lsp-signal-bars">
      {bars.map((h, i) => (
        <div
          key={i}
          className="lsp-bar"
          style={{
            height: `${h * 100}%`,
            animationDelay: `${i * 0.06}s`,
            animationDuration: `${0.7 + i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Blinking dots ─── */
function BlinkingDots() {
  return (
    <span className="lsp-dots">
      {[0, 1, 2].map(i => (
        <span key={i} className="lsp-dot" style={{ animationDelay: `${i * 0.2}s` }}>
          .
        </span>
      ))}
    </span>
  );
}

/* ─── Scanline overlay ─── */
function Scanline() {
  return (
    <div className="lsp-scanline-wrap" aria-hidden="true">
      <div className="lsp-scanline" />
    </div>
  );
}

/* ─── CRT corner brackets ─── */
function CornerMarks() {
  return (
    <>
      <div className="lsp-corner lsp-corner--tl" aria-hidden="true" />
      <div className="lsp-corner lsp-corner--tr" aria-hidden="true" />
      <div className="lsp-corner lsp-corner--bl" aria-hidden="true" />
      <div className="lsp-corner lsp-corner--br" aria-hidden="true" />
    </>
  );
}

/* ─── Main component ─── */
export default function LoadStatePanel({
  status,
  onRetry,
  loadingMessage = 'Fetching live channel data',
  errorTitle = 'Signal lost',
  errorMessage = 'Could not reach the stream server. Check your connection and try again.',
}) {
  const [shaking, setShaking] = useState(false);
  const shakeTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  const handleRetry = () => {
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    setShaking(true);
    shakeTimeoutRef.current = setTimeout(() => setShaking(false), 450);
    onRetry?.();
  };

  /* ══════════════════════════════ LOADING ══════════════════════════════ */
  if (status === 'loading') {
    return (
      <main>
        <div className="lsp-loading-outer">
          <div className="lsp-card lsp-loading-card">
            <Scanline />
            <CornerMarks />

            {/* REC / LIVE badge */}
            <div className="lsp-live-badge">
              <span className="lsp-live-dot" />
              LIVE
            </div>

            {/* Signal bars icon */}
            <div className="lsp-icon-ring">
              <SignalBars />
            </div>

            {/* Text */}
            <p className="lsp-connecting-title">
              Connecting
              <BlinkingDots />
            </p>
            <p className="lsp-connecting-sub">{loadingMessage}</p>

            {/* Indeterminate progress sweep */}
            <div className="lsp-progress-track">
              <div className="lsp-progress-sweep" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ═══════════════════════════════ ERROR ═══════════════════════════════ */
  if (status === 'error') {
    return (
      <main>
        <div className={`lsp-card lsp-error-card${shaking ? ' lsp-shake' : ''}`}>
          <Scanline />

          {/* Header row */}
          <div className="lsp-error-header">
            <div className="lsp-error-icon">📡</div>
            <div>
              <div className="lsp-error-label">Error · No Signal</div>
              <h1 className="lsp-error-title">{errorTitle}</h1>
            </div>
          </div>

          <p className="lsp-error-message">{errorMessage}</p>

          <div className="lsp-error-divider" />

          <button
            type="button"
            onClick={handleRetry}
            className="lsp-retry-btn"
          >
            ↺ Retry connection
          </button>
        </div>
      </main>
    );
  }

  return null;
}
