import { SITE_BRANDING } from '@/config/site';

export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/'
      }
    ],
    sitemap: `${SITE_BRANDING.siteUrl}/sitemap.xml`
  };
}
