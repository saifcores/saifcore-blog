"use client";

import { useTheme } from "@/components/theme-provider";

type ThemedDiagramImageProps = {
  lightSrc: string;
  darkSrc: string;
  alt: string;
};

export function ThemedDiagramImage({
  lightSrc,
  darkSrc,
  alt,
}: ThemedDiagramImageProps) {
  const { theme } = useTheme();
  const src = theme === "dark" ? darkSrc : lightSrc;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img key={src} src={src} alt={alt} className="diagram-image" />
  );
}
