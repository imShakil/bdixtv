function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function compact(value) {
  return normalize(value).replace(/\s+/g, '');
}

function scoreMatch(target, candidate) {
  const targetNorm = normalize(target);
  const candidateNorm = normalize(candidate);
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
  if (candidateNorm.includes(targetNorm)) {
    return 80;
  }
  if (targetNorm.includes(candidateNorm)) {
    return 70;
  }
  return 0;
}

export function findBestChannelMatch(channelName, channels) {
  if (!channelName || !Array.isArray(channels) || channels.length === 0) {
    return null;
  }

  let best = null;
  let bestScore = 0;

  for (const channel of channels) {
    const score = scoreMatch(channelName, channel?.name);
    if (score > bestScore) {
      best = channel;
      bestScore = score;
    }
  }

  return bestScore >= 70 ? best : null;
}
