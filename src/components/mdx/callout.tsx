type CalloutProps = {
  variant?: "info" | "warning";
  children: React.ReactNode;
};

export function Callout({ variant = "info", children }: CalloutProps) {
  return (
    <aside
      className={`rounded-2xl border px-4 py-4 text-sm leading-relaxed ${
        variant === "warning"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-100/90"
          : "border-sky-500/30 bg-sky-500/10 text-sky-100/90"
      }`}
    >
      {children}
    </aside>
  );
}
