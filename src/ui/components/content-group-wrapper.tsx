import type { ReactNode } from 'react';

interface ContentGroupWrapperProps {
  title: string;
  children: ReactNode;
}

/**
 * ContentGroupWrapper — a sub-grouping label inside a section. Mirrors the
 * Flutter `ContentGroupWrapper`.
 *
 * Visual role: one step below the section title. Rendered as an overline
 * (uppercase, letter-spaced, muted) so the hierarchy reads clearly:
 * section title → overline label → body/code/example.
 */
export function ContentGroupWrapper({
  title,
  children,
}: ContentGroupWrapperProps) {
  return (
    <div className="flex flex-col gap-md">
      <p className="text-overline font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
        {title}
      </p>
      {children}
    </div>
  );
}
