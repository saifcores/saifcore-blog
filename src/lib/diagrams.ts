import fs from "fs";
import path from "path";

/** Public asset path (e.g. `/diagrams/foo.drawio`). */
export function normalizeDiagramSrc(src: string): string {
  return src.startsWith("/") ? src : `/${src}`;
}

export function publicDiagramExists(src: string): boolean {
  const relative = normalizeDiagramSrc(src).replace(/^\//, "");
  return fs.existsSync(path.join(process.cwd(), "public", relative));
}

export function getDrawioSvgSibling(drawioSrc: string): string | null {
  const svgSrc = normalizeDiagramSrc(drawioSrc).replace(/\.drawio$/i, ".svg");
  return publicDiagramExists(svgSrc) ? svgSrc : null;
}

/** Resolve light/dark SVG paths for a base export (`foo.svg` + optional `foo.dark.svg`). */
export function resolveThemedSvgVariants(baseSvg: string): {
  light: string;
  dark: string;
} {
  const normalized = normalizeDiagramSrc(baseSvg);
  const darkCandidate = normalized.replace(/\.svg$/i, ".dark.svg");
  const hasLight = publicDiagramExists(normalized);
  const hasDark = publicDiagramExists(darkCandidate);

  const light = hasLight ? normalized : hasDark ? darkCandidate : normalized;
  const dark = hasDark ? darkCandidate : light;

  return { light, dark };
}

export function getThemedDarkSvgPath(baseSvg: string): string {
  return normalizeDiagramSrc(baseSvg).replace(/\.svg$/i, ".dark.svg");
}

export function isRasterDiagram(src: string): boolean {
  return /\.(png|webp|jpe?g)$/i.test(src);
}

export function isSvgDiagram(src: string): boolean {
  return /\.svg$/i.test(src);
}

export function isDrawioSource(src: string): boolean {
  return /\.drawio$/i.test(src);
}

export { buildDrawioViewerUrl } from "./diagram-viewer-url";
