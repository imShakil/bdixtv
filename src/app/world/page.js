import WorldChannelApp from '@/components/WorldChannelApp';
import { WORLD_PAGE_METADATA } from '@/config/site';

export const metadata = {
  title: WORLD_PAGE_METADATA.title,
  description: WORLD_PAGE_METADATA.description
};

export default function WorldPage() {
  return <WorldChannelApp />;
}
