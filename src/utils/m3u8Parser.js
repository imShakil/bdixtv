function parseAttributes(line) {
  const attrRegex = /(\w+(?:-\w+)*)="([^"]*)"/g;
  const attrs = {};
  let match = attrRegex.exec(line);

  while (match) {
    attrs[match[1].toLowerCase()] = match[2];
    match = attrRegex.exec(line);
  }

  return attrs;
}

export function parseM3U8(playlistText) {
  const lines = playlistText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const channels = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (!line.startsWith('#EXTINF')) {
      continue;
    }

    const attrs = parseAttributes(line);
    const namePart = line.split(',').slice(1).join(',').trim();
    const source = lines[i + 1];

    if (!source || source.startsWith('#')) {
      continue;
    }

    channels.push({
      id: `playlist-${channels.length + 1}`,
      name: attrs['tvg-name'] || namePart || `Channel ${channels.length + 1}`,
      logo: attrs['tvg-logo'] || '',
      type: 'm3u8',
      source,
      category: attrs['group-title'] || 'Uncategorized',
      language: attrs['tvg-language'] || ''
    });
  }

  return channels;
}
