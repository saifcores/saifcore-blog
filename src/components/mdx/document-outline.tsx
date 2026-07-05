type DocumentOutlineProps = {
  title: string;
  items?: string[];
};

export function DocumentOutline({ title, items = [] }: DocumentOutlineProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/60 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </h3>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-[var(--text-secondary)] marker:text-[var(--accent-blue)]">
        {items.map((line) => (
          <li key={line} className="leading-relaxed">
            {line}
          </li>
        ))}
      </ol>
    </div>
  );
}
