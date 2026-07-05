import { Children, isValidElement, type ReactNode } from "react";

/** Flatten MDX/React children into plain text (for fenced code blocks). */
export function extractMdxText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractMdxText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractMdxText(node.props.children);
  }

  return "";
}

export function isMermaidPre(children: ReactNode): boolean {
  const child = Children.toArray(children)[0];
  if (!isValidElement<{ className?: string; children?: ReactNode }>(child)) {
    return false;
  }

  if (
    typeof child.props.className === "string" &&
    child.props.className.includes("language-mermaid")
  ) {
    return true;
  }

  const codeChild = Children.toArray(child.props.children)[0];
  if (!isValidElement<{ className?: string }>(codeChild)) return false;
  return (
    typeof codeChild.props.className === "string" &&
    codeChild.props.className.includes("language-mermaid")
  );
}
