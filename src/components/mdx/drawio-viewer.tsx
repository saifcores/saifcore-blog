"use client";

import { useMemo } from "react";
import { useTheme } from "@/components/theme-provider";
import { buildDrawioViewerUrl } from "@/lib/diagram-viewer-url";

type DrawioViewerProps = {
  viewerUrl: string;
  drawioUrl: string;
  title?: string;
};

export function DrawioViewer({
  viewerUrl,
  drawioUrl,
  title,
}: DrawioViewerProps) {
  const { theme } = useTheme();

  const src = useMemo(
    () =>
      theme === "dark"
        ? buildDrawioViewerUrl(drawioUrl, title, { dark: true })
        : viewerUrl,
    [theme, drawioUrl, title, viewerUrl],
  );

  return (
    <div className="drawio-viewer">
      <iframe
        key={src}
        src={src}
        title={title ?? "Draw.io architecture diagram"}
        loading="lazy"
        className="drawio-viewer-frame"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
