const STORAGE_KEY = 'bdiptv_telemetry';

function readTelemetry() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTelemetry(records) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-100)));
  } catch {
    // no-op
  }
}

export function logEvent(name, payload = {}) {
  const entry = {
    type: 'event',
    name,
    payload,
    at: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    const records = readTelemetry();
    records.push(entry);
    writeTelemetry(records);
    console.info('[bdiptv:event]', name, payload);
  }
}

export function recordMetric(name, value, tags = {}) {
  const entry = {
    type: 'metric',
    name,
    value,
    tags,
    at: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    const records = readTelemetry();
    records.push(entry);
    writeTelemetry(records);
    console.info('[bdiptv:metric]', name, value, tags);
  }
}
