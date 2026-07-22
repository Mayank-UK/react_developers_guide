interface PlaceholderViewProps {
  /** Where this lands in the phased build (M2/M3/M4). */
  phase?: string;
  children?: React.ReactNode;
}

/**
 * PlaceholderView — temporary body for routes whose full content arrives in a
 * later milestone. The page title is rendered by the shared RootLayout (from
 * the route's handle), so this just shows the "coming soon" note.
 */
export function PlaceholderView({ phase, children }: PlaceholderViewProps) {
  return (
    <div className="rounded-lg border border-dashed border-outline p-lg text-center">
      <p className="text-[var(--text-body)] text-on-surface-variant">
        {phase ? `Coming in ${phase}. ` : ''}
        The architecture foundation is in place — this screen's content lands in
        a later milestone.
      </p>
      {children}
    </div>
  );
}
