import type { Metadata } from "next";
import { getSiteUrl } from "@/site";

type PageMetadataInput = {
  locale: string;
  path: string;
  title: string;
  description: string;
  openGraphType?: "website" | "article";
  publishedTime?: string;
  image?: string;
};

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  openGraphType = "website",
  publishedTime,
  image,
}: PageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const localizedPath =
    locale === "en" && !path.startsWith("/fr")
      ? path
      : `/${locale}${path === "/" ? "" : path}`;

  const canonicalUrl = new URL(
    localizedPath === "/" ? "/" : localizedPath,
    `${siteUrl}/`,
  ).toString();

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath,
      languages: {
        en: path,
        fr: `/fr${path === "/" ? "" : path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "SAIFCORE Blog",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: openGraphType,
      ...(publishedTime ? { publishedTime } : {}),
      ...(image
        ? { images: [{ url: new URL(image, `${siteUrl}/`).toString() }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [new URL(image, `${siteUrl}/`).toString()] } : {}),
    },
  };
}
