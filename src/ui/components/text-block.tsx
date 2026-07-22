interface TextBlockProps {
  children: string;
}

/**
 * TextBlock — a full-width paragraph of body text. Mirrors the Flutter
 * `TextBlock`. Kept string-only so multi-line examples render predictably
 * (whitespace preserved via `white-space: pre-line`).
 *
 * Generous line-height (1.7) and the muted variant color give body copy room to
 * breathe and read as secondary to headings, improving differentiation.
 */
export function TextBlock({ children }: TextBlockProps) {
  return (
    <p className="w-full text-[var(--text-body)] leading-[1.7] text-on-surface-variant [white-space:pre-line]">
      {children}
    </p>
  );
}
