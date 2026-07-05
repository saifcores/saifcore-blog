import type { Metadata } from "next";
import { getSiteUrl } from "@/site";

export const DEFAULT_OG_IMAGE = "/profile.png";

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

type ArticleJsonLdInput = {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  coverImage: string;
};

export function buildArticleJsonLd({
  locale,
  slug,
  title,
  excerpt,
  publishedAt,
  coverImage,
}: ArticleJsonLdInput) {
  const siteUrl = getSiteUrl();
  const path = locale === "fr" ? `/fr/articles/${slug}` : `/articles/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    datePublished: `${publishedAt}T12:00:00.000Z`,
    author: {
      "@type": "Organization",
      name: "SAIFCORE",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "SAIFCORE",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: new URL(DEFAULT_OG_IMAGE, `${siteUrl}/`).toString(),
      },
    },
    image: new URL(coverImage, `${siteUrl}/`).toString(),
    mainEntityOfPage: new URL(path, `${siteUrl}/`).toString(),
    inLanguage: locale === "fr" ? "fr-FR" : "en-US",
  };
}
