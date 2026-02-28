function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function canonicalize(value) {
  return normalize(value)
    .replace(/\bsuper\s+sports?\b/g, 'supersport')
    .replace(/\bsky\s+sports?\b/g, 'sky sports')
    .replace(/\bbein\s+sports?\b/g, 'beinsports')
    .replace(/\bptv\s+sports?\b/g, 'ptvsports')
    .replace(/\bsony\s+sports?\b/g, 'sonysports')
    .replace(/\bten\s+sports?\b/g, 'tensports')
    .replace(/\bstar\s+sports?\b/g, 'starsports')
    .replace(/\s+/g, ' ')
    .trim();
}

function compact(value) {
  return canonicalize(value).replace(/\s+/g, '');
}

const BRAND_PATTERNS = [
  'supersport',
  'sky sports',
  'willow',
  'starsports',
  'sonysports',
  'espn',
  'tensports',
  'ptvsports',
  'beinsports'
];

const GENERIC_TOKENS = new Set([
  'tv',
  'hd',
  'live',
  'channel',
  'sport',
  'sports',
  'us',
  'uk',
  'sd'
]);

function detectBrand(normalizedName) {
  for (const brand of BRAND_PATTERNS) {
    if (normalizedName.includes(brand)) {
      return brand;
    }
  }
  return '';
}

function tokenize(value) {
  return canonicalize(value).split(' ').filter(Boolean);
}

function meaningfulTokens(value) {
  return tokenize(value).filter((token) => !GENERIC_TOKENS.has(token));
}

function numericTokens(value) {
  return tokenize(value).filter((token) => /^\d+$/.test(token));
}

function overlapCount(aTokens, bTokens) {
  const bSet = new Set(bTokens);
  let count = 0;
  for (const token of aTokens) {
    if (bSet.has(token)) {
      count += 1;
    }
  }
  return count;
}

export function scoreChannelMatch(target, candidate) {
  const targetNorm = canonicalize(target);
  const candidateNorm = canonicalize(candidate);
  const targetCompact = compact(target);
  const candidateCompact = compact(candidate);

  if (!targetNorm || !candidateNorm) {
    return 0;
  }
  if (targetNorm === candidateNorm) {
    return 100;
  }
  if (targetCompact === candidateCompact) {
    return 95;
  }

  const targetBrand = detectBrand(targetNorm);
  const candidateBrand = detectBrand(candidateNorm);
  if (targetBrand && candidateBrand && targetBrand !== candidateBrand) {
    return 0;
  }

  const targetTokens = meaningfulTokens(target);
  const candidateTokens = meaningfulTokens(candidate);
  if (!targetTokens.length || !candidateTokens.length) {
    return 0;
  }

  const overlap = overlapCount(targetTokens, candidateTokens);
  if (overlap === 0) {
    return 0;
  }

  let score = Math.round((overlap / targetTokens.length) * 85);

  if (targetBrand && candidateBrand && targetBrand === candidateBrand) {
    score += 10;
  }

  if (candidateNorm.includes(targetNorm)) {
    score += 5;
  }

  const targetNums = numericTokens(target);
  if (targetNums.length > 0) {
    const candidateNums = new Set(numericTokens(candidate));
    const matchedNums = targetNums.filter((token) => candidateNums.has(token)).length;
    if (matchedNums !== targetNums.length) {
      score -= 20;
    }
  }

  return Math.max(0, Math.min(100, score));
}

export function findBestChannelMatch(channelName, channels, { excludeKeys = new Set(), minScore = 75 } = {}) {
  if (!channelName || !Array.isArray(channels) || channels.length === 0) {
    return null;
  }

  let best = null;
  let bestScore = 0;

  for (const channel of channels) {
    const channelKey = channel?.id || `${channel?.name || ''}|${channel?.source || ''}`;
    if (excludeKeys.has(channelKey)) {
      continue;
    }

    const score = scoreChannelMatch(channelName, channel?.name);
    if (score > bestScore) {
      best = channel;
      bestScore = score;
    }
  }

  return bestScore >= minScore ? best : null;
}

export function findBestChannelMatches(channelNames, channels, { minScore = 75 } = {}) {
  if (!Array.isArray(channelNames) || channelNames.length === 0) {
    return [];
  }
  if (!Array.isArray(channels) || channels.length === 0) {
    return channelNames.map((name) => ({ name, match: null }));
  }

  const candidates = [];
  for (let i = 0; i < channelNames.length; i += 1) {
    const name = channelNames[i];
    for (const channel of channels) {
      const score = scoreChannelMatch(name, channel?.name);
      if (score >= minScore) {
        candidates.push({
          index: i,
          channel,
          score,
          key: channel?.id || `${channel?.name || ''}|${channel?.source || ''}`
        });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const usedIndexes = new Set();
  const usedKeys = new Set();
  const chosen = new Map();

  for (const candidate of candidates) {
    if (usedIndexes.has(candidate.index) || usedKeys.has(candidate.key)) {
      continue;
    }
    usedIndexes.add(candidate.index);
    usedKeys.add(candidate.key);
    chosen.set(candidate.index, candidate.channel);
  }

  return channelNames.map((name, index) => ({
    name,
    match: chosen.get(index) || null
  }));
}
