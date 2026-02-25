import WorldChannelAppContainer from '@/features/world/containers/WorldChannelAppContainer';
import { WORLD_PAGE_METADATA } from '@/config/site';

export const metadata = {
  title: WORLD_PAGE_METADATA.title,
  description: WORLD_PAGE_METADATA.description
};

export default function WorldPage() {
  return <WorldChannelAppContainer />;
}
