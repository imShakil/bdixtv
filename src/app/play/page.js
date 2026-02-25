import CustomUrlPlayerContainer from '@/features/play/containers/CustomUrlPlayerContainer';
import { PLAY_PAGE_METADATA } from '@/config/site';

export const metadata = {
  title: PLAY_PAGE_METADATA.title,
  description: PLAY_PAGE_METADATA.description
};

export default function PlayPage() {
  return <CustomUrlPlayerContainer />;
}
