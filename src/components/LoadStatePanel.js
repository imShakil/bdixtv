'use client';

export default function LoadStatePanel({
  status,
  onRetry,
  loadingMessage = 'Loading channels...',
  errorTitle = 'Unable to load channels',
  errorMessage = 'Check your network on this device and try again.'
}) {
  if (status === 'loading') {
    return (
      <main>
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-steel/20 bg-white/90 px-6 py-10 text-center shadow-card">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 ring-1 ring-sea/30">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            </span>
            <div className="space-y-1">
              <p className="text-base font-semibold text-ink">Loading channels</p>
              <p className="text-sm text-steel">{loadingMessage}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main>
        <div className="space-y-4 rounded-2xl border border-amber-300 bg-amber-50 p-8 text-amber-900 shadow-card">
          <h1 className="text-xl font-semibold">{errorTitle}</h1>
          <p className="text-sm">{errorMessage}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return null;
}
