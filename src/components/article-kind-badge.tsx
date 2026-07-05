import type { ArticleKind } from "@/lib/types";

const kindClass: Record<ArticleKind, string> = {
  writing:
    "border-[var(--border-subtle)] bg-[var(--bg-elevated)]/80 text-[var(--text-muted)]",
  code: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300/95",
  design: "border-violet-500/35 bg-violet-500/10 text-violet-200/95",
  adr: "border-amber-500/35 bg-amber-500/10 text-amber-200/95",
  document: "border-sky-500/35 bg-sky-500/10 text-sky-200/95",
};

export function ArticleKindBadge({
  kind,
  label,
}: {
  kind: ArticleKind;
  label: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${kindClass[kind]}`}
    >
      {label}
    </span>
  );
}
