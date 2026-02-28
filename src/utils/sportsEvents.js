const INTERNATIONAL_EVENT_KEYWORDS = [
  'cricket',
  'football',
  'soccer',
  'fifa',
  'olympic',
  'world cup',
  'icc',
  'uefa',
  'afc',
  'conmebol',
  'concacaf',
  'copa',
  'euro',
  'nations league',
  't20',
  'odi',
  'test championship'
];

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function readGeneratedSportsEvents(payload) {
  const rawEvents = Array.isArray(payload?.events) ? payload.events : [];

  return rawEvents
    .map((event, index) => {
      const sport = String(event?.sport ?? event?.category ?? '').trim();
      const league = String(event?.league ?? event?.competition ?? '').trim();
      const homeTeam = String(event?.homeTeam ?? event?.home ?? event?.team1 ?? '').trim();
      const awayTeam = String(event?.awayTeam ?? event?.away ?? event?.team2 ?? '').trim();
      const startTimeUtc = String(
        event?.startTimeUtc ?? event?.start_time_utc ?? event?.startTime ?? event?.dateTimeUtc ?? ''
      ).trim();
      const id = String(event?.id ?? event?.eventId ?? `${sport}-${league}-${index}`).trim();

      return {
        id,
        sport,
        league,
        homeTeam,
        awayTeam,
        startTimeUtc
      };
    })
    .filter((event) => (
      event.id
      && event.sport
      && event.homeTeam
      && event.awayTeam
      && event.startTimeUtc
    ))
    .sort((a, b) => new Date(a.startTimeUtc) - new Date(b.startTimeUtc));
}

export function filterInternationalSportsEvents(events) {
  return events.filter((event) => {
    const searchableText = [
      event?.sport,
      event?.league,
      event?.homeTeam,
      event?.awayTeam
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return INTERNATIONAL_EVENT_KEYWORDS.some((keyword) => searchableText.includes(keyword));
  });
}

export function getEventStatus(event, now = new Date()) {
  const start = new Date(event.startTimeUtc);
  const end = addHours(start, event.sport === 'cricket' ? 4 : 2);

  if (now >= start && now < end) {
    return 'live';
  }
  if (now < start) {
    return 'upcoming';
  }
  return 'finished';
}
