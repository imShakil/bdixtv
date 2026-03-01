import { SITE_BRANDING } from '@/config/site';

export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: SITE_BRANDING.title,
    short_name: SITE_BRANDING.title,
    description: SITE_BRANDING.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0891b2',
    icons: [
      {
        src: '/uploads/dekho-prime-icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: SITE_BRANDING.iconPath,
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };
}
