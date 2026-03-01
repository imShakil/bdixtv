'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SITE_BRANDING } from '@/config/site';

const MENU_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Featuring', href: '/featuring' },
  { label: 'World IPTV', href: '/world' },
  { label: 'Events', href: '/events' },
  { label: 'IPTV Player', href: '/play' }
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isItemActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="safe-area-top sticky top-0 z-40 border-b border-steel/15 bg-white/75 backdrop-blur-md">
      <nav className="safe-area-x mx-auto w-full max-w-[1440px] px-3 py-3 md:flex md:items-center md:justify-between md:gap-4 md:px-4 xl:px-5">
        <div className="flex items-center justify-between gap-3">
          <a href="/" className="flex min-w-0 items-center gap-2">
            <img
              src="/uploads/dekho-prime-icon-header-128.png"
              alt={`${SITE_BRANDING.title} logo icon`}
              className="h-8 w-8 shrink-0 rounded-lg border border-steel/15 bg-white object-contain p-0.5 md:h-9 md:w-9"
            />
            <span className="min-w-0">
              <span className="block truncate text-base font-extrabold tracking-tight text-ink sm:text-lg md:text-xl">
                {SITE_BRANDING.title}
              </span>
              <span className="hidden truncate text-xs font-medium uppercase tracking-[0.06em] text-steel/90 sm:block">
                {SITE_BRANDING.tagline}
              </span>
            </span>
          </a>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-steel/20 bg-white text-ink md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-2.5 hidden w-full flex-wrap items-center gap-2 md:mt-0 md:flex md:w-auto">
          {MENU_ITEMS.map((item) => {
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-full px-3 py-1.5 text-center text-sm font-semibold transition ${
                  isActive
                    ? 'border border-sea bg-sea text-white shadow-sm'
                    : 'border border-steel/20 bg-white text-ink hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {isMobileMenuOpen ? (
          <div className="mt-2.5 space-y-1.5 rounded-xl border border-steel/15 bg-white/95 p-2 shadow-card md:hidden">
            {MENU_ITEMS.map((item) => {
              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-sea text-white'
                      : 'text-ink hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </nav>
    </header>
  );
}
