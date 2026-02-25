'use client';

export default function Error({ reset }) {
  return (
    <main>
      <div className="space-y-4 rounded-2xl border border-amber-300 bg-amber-50 p-8 text-amber-900 shadow-card">
        <h1 className="text-xl font-semibold">Unable to load channels</h1>
        <p className="text-sm">Some data sources may be unavailable right now. Try reloading.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
