import FeaturingChannelAppContainer from '@/features/featuring/containers/FeaturingChannelAppContainer';
import { FEATURING_PAGE_METADATA } from '@/config/site';

export const metadata = {
  title: FEATURING_PAGE_METADATA.title,
  description: FEATURING_PAGE_METADATA.description
};

export default function FeaturingPage() {
  return <FeaturingChannelAppContainer />;
}
