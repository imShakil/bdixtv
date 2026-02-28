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
            <img src="/icon.svg" alt="BDIX IPTV logo" className="h-7 w-7 shrink-0 rounded-lg border border-steel/20 md:h-8 md:w-8" />
            <span className="truncate text-sm font-extrabold tracking-tight text-ink sm:text-base md:text-lg">
              {SITE_BRANDING.title}
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
