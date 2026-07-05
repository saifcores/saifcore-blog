import type { ArticleKind } from "./types";

export const ADMIN_LOCALES = ["en", "fr"] as const;

export const ARTICLE_KINDS: ArticleKind[] = [
  "writing",
  "code",
  "design",
  "adr",
  "document",
  "reflection",
];

export const RELATED_PROJECTS = [
  "pan-african-payment-sdk",
  "double-entry-ledger",
  "unified-api-gateway",
] as const;

export const KIND_LABELS: Record<
  "en" | "fr",
  Record<ArticleKind, string>
> = {
  en: {
    writing: "Insight",
    code: "Code Example",
    design: "Design Rationale",
    adr: "Architecture Decision",
    document: "Reference Doc",
    reflection: "Reflection",
  },
  fr: {
    writing: "Analyse",
    code: "Exemple de code",
    design: "Note de design",
    adr: "Décision d'architecture",
    document: "Document de référence",
    reflection: "Réflexion",
  },
};

export const ADR_LABELS: Record<
  "en" | "fr",
  {
    statusLabel: string;
    contextLabel: string;
    decisionLabel: string;
    consequencesLabel: string;
  }
> = {
  en: {
    statusLabel: "Current Status",
    contextLabel: "Background & Context",
    decisionLabel: "Final Decision",
    consequencesLabel: "Tradeoffs & Consequences",
  },
  fr: {
    statusLabel: "Statut",
    contextLabel: "Contexte",
    decisionLabel: "Décision",
    consequencesLabel: "Conséquences",
  },
};

export const MDX_COMPONENTS_HELP = `## MDX components

<Callout variant="info">
  Info or warning callout. variant: "info" | "warning"
</Callout>

<CodeBlock title="Optional title" language="typescript">
{\`your code here\`}
</CodeBlock>

<Adr
  status="Accepted · 2025-01-01"
  context="Why we needed a decision"
  decision="What we chose"
  consequences="Trade-offs"
/>

<Drawio
  src="/diagrams/your-diagram.drawio"
  title="Diagram title"
  caption="Optional caption"
/>

<Mermaid chart="flowchart LR\\n  A --> B" title="Optional" />

Or fenced mermaid:

\`\`\`mermaid
sequenceDiagram
  A->>B: Hello
\`\`\`
`;
