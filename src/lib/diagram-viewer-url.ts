/** Shared Draw.io viewer URL builder (safe for client + server). */
export function buildDrawioViewerUrl(
  absoluteFileUrl: string,
  title?: string,
  options?: { dark?: boolean },
): string {
  const params = new URLSearchParams({
    lightbox: "1",
    highlight: "2563eb",
    edit: "0",
    layers: "1",
    nav: "1",
  });
  if (title) params.set("title", title);
  if (options?.dark) params.set("dark", "1");
  const encoded = encodeURIComponent(absoluteFileUrl);
  return `https://viewer.diagrams.net/?${params.toString()}#U${encoded}`;
}
