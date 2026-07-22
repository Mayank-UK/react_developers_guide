import { useState, type ReactNode } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  caption?: ReactNode;
  /** Start expanded instead of collapsed. Defaults to collapsed. */
  defaultOpen?: boolean;
}

/**
 * CodeBlock — a styled, monospace, copyable code listing that collapses by
 * default. Mirrors the "Code" half of the Flutter `CodePreviewTabs`, but
 * inlines the source instead of loading a markdown asset file.
 *
 * Collapsible (collapsed by default) so pages full of examples don't become a
 * wall of code: the language label + toggle stays visible, the source is one
 * click away. The copy button works whether open or closed.
 */
export function CodeBlock({ code, language, caption, defaultOpen = false }: CodeBlockProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable; ignore */
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-md border border-outline bg-surface-variant">
      <div className="flex items-center justify-between px-md py-xs">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-xs font-[var(--font-mono)] text-[var(--text-caption)] text-on-surface-variant hover:text-on-surface"
          aria-expanded={open}
        >
          <span className="inline-block w-[10px] text-center text-on-surface-variant">
            {open ? '▾' : '▸'}
          </span>
          {language ?? 'code'}
        </button>
        <button
          type="button"
          onClick={copy}
          className="rounded-sm px-xs text-[var(--text-caption)] text-on-surface-variant hover:bg-black/5 hover:text-on-surface"
        >
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      {open && (
        <>
          <pre className="overflow-x-auto border-t border-outline px-md py-md font-[var(--font-mono)] text-[var(--text-body-sm)] leading-relaxed text-on-surface">
            <code>{code}</code>
          </pre>
          {caption && (
            <div className="border-t border-outline bg-surface-variant px-md py-xs text-[var(--text-caption)] text-on-surface-variant">
              {caption}
            </div>
          )}
        </>
      )}
    </div>
  );
}
