import Link from 'next/link';
import { SITE_BRANDING } from '@/config/site';

export default function HeroHeader({
  totalCount,
  eyebrow = SITE_BRANDING.eyebrow,
  title = SITE_BRANDING.title
}) {
  const hasCount = typeof totalCount === 'number';

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-steel/20 bg-white/80 px-4 py-3 shadow-card md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-steel/80">{eyebrow}</p>
        <h1 className="text-[1.65rem] font-extrabold leading-none tracking-tight text-ink md:text-[2rem]">{title}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold md:text-sm">
        {hasCount ? (
          <span className="rounded-full bg-sea/15 px-3 py-1.5 text-sea">
            Available: {totalCount} channels
          </span>
        ) : null}
      </div>
    </div>
  );
}
