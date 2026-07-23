import type { ReactNode } from 'react';

interface ExampleProps {
  /** Optional label; defaults to "Live example". */
  label?: string;
  children: ReactNode;
}

/**
 * Example — a visually distinct container for live, interactive demonstrations.
 *
 * Unlike CodeBlock (a static listing with a grey surface-variant background),
 * Example uses a dashed border on the page surface with a "↳ Live example"
 * overline, signalling "this is something you can look at and touch, not just
 * read." Use it wherever a concept is demonstrated live rather than described.
 */
export function Example({ label = 'Live example', children }: ExampleProps) {
  return (
    <div className="flex flex-col gap-sm rounded-md border border-dashed border-outline bg-surface-variant p-md">
      <p className="text-overline font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
        ↳ {label}
      </p>
      {children}
    </div>
  );
}
