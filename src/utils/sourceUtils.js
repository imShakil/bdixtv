export function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeIframeSource(source) {
  if (!source) {
    return '';
  }

  if (isHttpUrl(source)) {
    return source;
  }

  const match = source.match(/src=["']([^"']+)["']/i);
  const candidate = match?.[1] || '';

  return isHttpUrl(candidate) ? candidate : '';
}
