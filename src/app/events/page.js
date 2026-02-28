import SportsEventsPage from '@/components/SportsEventsPage';
import { EVENTS_PAGE_METADATA } from '@/config/site';

export const metadata = EVENTS_PAGE_METADATA;

export default function EventsPageRoute() {
  return <SportsEventsPage />;
}
