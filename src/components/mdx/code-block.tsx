type CodeBlockProps = {
  title?: string;
  language?: string;
  children: string;
};

export function CodeBlock({ title, children }: CodeBlockProps) {
  return (
    <figure className="code-block overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-code)] shadow-[inset_0_1px_0_var(--border-code)]">
      {title ? (
        <figcaption className="border-b border-[var(--border-code)] px-4 py-2.5 text-xs font-medium text-[var(--text-muted)]">
          {title}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-[#cbd5e1] [tab-size:2]">
          {children}
        </code>
      </pre>
    </figure>
  );
}
