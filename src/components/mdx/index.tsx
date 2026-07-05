import { Children, isValidElement } from "react";
import type { MDXComponents } from "mdx/types";
import { Adr } from "./adr";
import { Callout } from "./callout";
import { CodeBlock } from "./code-block";
import { DesignNote } from "./design-note";
import { DocumentOutline } from "./document-outline";
import { Drawio } from "./drawio";
import { extractMdxText, isMermaidPre } from "./extract-mdx-text";
import { Mermaid } from "./mermaid";

export const mdxComponents: MDXComponents = {
  Adr,
  Callout,
  CodeBlock,
  DesignNote,
  DocumentOutline,
  Drawio,
  Mermaid,
  h2: (props) => (
    <h2
      className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="text-lg font-semibold text-[var(--text-primary)]"
      {...props}
    />
  ),
  p: (props) => (
    <p className="text-[var(--text-secondary)] leading-relaxed" {...props} />
  ),
  ul: (props) => (
    <ul
      className="list-disc space-y-2 pl-5 text-[var(--text-secondary)] marker:text-[var(--accent-blue)]"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="list-decimal space-y-2 pl-5 text-[var(--text-secondary)] marker:text-[var(--accent-blue)]"
      {...props}
    />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  strong: (props) => (
    <strong className="font-semibold text-[var(--text-primary)]" {...props} />
  ),
  a: (props) => (
    <a
      className="text-accent underline-offset-2 transition hover:underline"
      {...props}
    />
  ),
  pre: (props) => {
    if (isMermaidPre(props.children)) {
      const child = Children.toArray(props.children)[0];
      if (isValidElement<{ children?: React.ReactNode }>(child)) {
        const chart = extractMdxText(child.props.children);
        return <Mermaid chart={chart} />;
      }
    }

    return (
      <pre
        className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-code)] p-4 text-[13px] leading-relaxed"
        {...props}
      />
    );
  },
  code: (props) => (
    <code
      className="font-mono text-[var(--text-secondary)] [tab-size:2]"
      {...props}
    />
  ),
};
