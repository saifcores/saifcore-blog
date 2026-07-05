import Image from "next/image";
import { getSiteUrl } from "@/site";
import { buildDrawioViewerUrl } from "@/lib/diagram-viewer-url";
import {
  getDrawioSvgSibling,
  isDrawioSource,
  isRasterDiagram,
  isSvgDiagram,
  normalizeDiagramSrc,
  publicDiagramExists,
  resolveThemedSvgVariants,
} from "@/lib/diagrams";
import { DiagramFigure } from "./diagram-figure";
import { DrawioViewer } from "./drawio-viewer";
import { ThemedDiagramImage } from "./themed-diagram-image";

type DrawioProps = {
  /** `/diagrams/foo.drawio`, `.svg`, or raster export. */
  src: string;
  title?: string;
  caption?: string;
  alt?: string;
};

export function Drawio({ src, title, caption, alt }: DrawioProps) {
  const normalized = normalizeDiagramSrc(src);
  const label = alt ?? title ?? "Architecture diagram";
  const drawioSource = isDrawioSource(normalized) ? normalized : undefined;

  const svgSibling = isDrawioSource(normalized)
    ? getDrawioSvgSibling(normalized)
    : null;
  const imageSrc =
    svgSibling ?? (publicDiagramExists(normalized) ? normalized : null);

  if (imageSrc && (isSvgDiagram(imageSrc) || isRasterDiagram(imageSrc))) {
    const themedSvg = isSvgDiagram(imageSrc)
      ? resolveThemedSvgVariants(imageSrc)
      : null;

    return (
      <DiagramFigure title={title} caption={caption} source={drawioSource}>
        {themedSvg ? (
          <ThemedDiagramImage
            lightSrc={themedSvg.light}
            darkSrc={themedSvg.dark}
            alt={label}
          />
        ) : (
          <Image
            src={imageSrc}
            alt={label}
            width={1280}
            height={720}
            className="diagram-image"
            unoptimized
          />
        )}
      </DiagramFigure>
    );
  }

  if (isDrawioSource(normalized) && publicDiagramExists(normalized)) {
    const siteUrl = getSiteUrl();
    const absoluteUrl = `${siteUrl}${normalized}`;
    const viewerUrl = buildDrawioViewerUrl(absoluteUrl, title);

    return (
      <DiagramFigure title={title} caption={caption} source={normalized}>
        <DrawioViewer
          viewerUrl={viewerUrl}
          drawioUrl={absoluteUrl}
          title={title}
        />
      </DiagramFigure>
    );
  }

  return (
    <DiagramFigure title={title} caption={caption}>
      <p className="diagram-error" role="alert">
        Diagram not found: <code>{normalized}</code>
      </p>
    </DiagramFigure>
  );
}
