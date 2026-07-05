type AdrProps = {
  status: string;
  context: string;
  decision: string;
  consequences: string;
  statusLabel?: string;
  contextLabel?: string;
  decisionLabel?: string;
  consequencesLabel?: string;
};

export function Adr({
  status,
  context,
  decision,
  consequences,
  statusLabel = "Status",
  contextLabel = "Context",
  decisionLabel = "Decision",
  consequencesLabel = "Consequences",
}: AdrProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 p-5 sm:p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
        {statusLabel} · {status}
      </p>
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {contextLabel}
          </h3>
          <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
            {context}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {decisionLabel}
          </h3>
          <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
            {decision}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {consequencesLabel}
          </h3>
          <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
            {consequences}
          </p>
        </div>
      </div>
    </div>
  );
}
