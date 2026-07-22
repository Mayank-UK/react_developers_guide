import type { ReactNode } from 'react';

interface SectionWrapperProps {
  title: string;
  children: ReactNode;
}

/**
 * SectionWrapper — a titled, surface-tinted block grouping related content.
 * Mirrors the Flutter `SectionWrapper`.
 *
 * Visual role: the primary structural unit of a page. The title carries a
 * coloured accent bar so sections are scannable, and there's generous vertical
 * breathing room (mb-lg) between siblings so long pages don't read as a wall.
 */
export function SectionWrapper({ title, children }: SectionWrapperProps) {
  return (
    <section className="mb-lg w-full rounded-lg border border-outline bg-surface p-lg shadow-button-card">
      <h2 className="mb-lg flex items-center gap-sm text-[var(--text-title-lg)] font-semibold text-on-surface">
        <span
          aria-hidden
          className="inline-block h-[24px] w-[4px] rounded-pill"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        {title}
      </h2>
      <div className="flex flex-col gap-md">{children}</div>
    </section>
  );
}
