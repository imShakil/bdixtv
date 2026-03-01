import { SITE_BRANDING } from '@/config/site';

const ROUTES = ['/', '/play', '/featuring', '/world', '/events', '/event', '/privacy'];

export const dynamic = 'force-static';

export default function sitemap() {
  const now = new Date();
  return ROUTES.map((route) => ({
    url: `${SITE_BRANDING.siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.8
  }));
}
