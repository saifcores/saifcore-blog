"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { DiagramFigure } from "./diagram-figure";

type MermaidProps = {
  chart: string;
  title?: string;
  caption?: string;
};

function isC4Chart(chart: string): boolean {
  return /^\s*C4(Context|Container|Component|Dynamic)/m.test(chart.trim());
}

function getMermaidTheme(resolved: "light" | "dark", chart: string) {
  if (isC4Chart(chart)) {
    return {
      theme: resolved === "dark" ? ("dark" as const) : ("default" as const),
    };
  }

  if (resolved === "dark") {
    return {
      theme: "dark" as const,
      themeVariables: {
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        primaryColor: "#1e3a5f",
        primaryTextColor: "#e2e8f0",
        primaryBorderColor: "#2563eb",
        lineColor: "#64748b",
        secondaryColor: "#0f172a",
        tertiaryColor: "#111827",
      },
    };
  }

  return {
    theme: "base" as const,
    themeVariables: {
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      primaryColor: "#dbeafe",
      primaryTextColor: "#0c0c12",
      primaryBorderColor: "#2563eb",
      lineColor: "#64748b",
      secondaryColor: "#f8fafc",
      tertiaryColor: "#f1f5f9",
    },
  };
}

export function Mermaid({ chart, title, caption }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderId = useId().replace(/:/g, "");
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!containerRef.current) return;

      try {
        const mermaid = (await import("mermaid")).default;
        const themeConfig = getMermaidTheme(theme, chart);

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          ...themeConfig,
        });

        const { svg, bindFunctions } = await mermaid.render(
          `mermaid-${renderId}`,
          chart.trim(),
        );

        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = svg;
        bindFunctions?.(containerRef.current);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to render diagram.";
        setError(message);
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [chart, renderId, theme]);

  return (
    <DiagramFigure title={title} caption={caption}>
      {error ? (
        <pre className="diagram-error" role="alert">
          {error}
        </pre>
      ) : null}
      <div
        ref={containerRef}
        className="mermaid-diagram"
        aria-label={title ?? "Mermaid diagram"}
      />
    </DiagramFigure>
  );
}
