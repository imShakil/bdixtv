'use client';

import { useEffect, useState } from 'react';
import { filterInternationalSportsEvents, readGeneratedSportsEvents } from '@/utils/sportsEvents';

const REMOTE_EVENTS_URL = 'https://daily-sports-events.mhshakil555.workers.dev/events.json?refresh=1';

export default function useDailySportsEvents({ internationalOnly = true } = {}) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState('remote');
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadEvents() {
      try {
        const response = await fetch(REMOTE_EVENTS_URL, {
          cache: 'no-store',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            Accept: 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to load remote sports events: ${response.status}`);
        }

        const payload = await response.json();
        const parsedEvents = readGeneratedSportsEvents(payload);
        const nextEvents = internationalOnly
          ? filterInternationalSportsEvents(parsedEvents)
          : parsedEvents;
        if (!isActive) {
          return;
        }

        setEvents(nextEvents);
        setSource('remote');
        setError('');
      } catch (error) {
        if (!isActive) {
          return;
        }
        console.error('Failed to fetch events payload', error);
        setEvents([]);
        setSource('unavailable');
        setError(error instanceof Error ? error.message : 'Unknown fetch error');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isActive = false;
    };
  }, [internationalOnly]);

  return { events, isLoading, source, error };
}
