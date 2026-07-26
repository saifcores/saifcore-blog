import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/posts";
import { getPortfolioUrl, getSiteUrl } from "@/site";

const DEFAULT_LIMIT = 3;
const MAX_LIMIT = 10;
const LOCALES = new Set(["en", "fr"]);

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": getPortfolioUrl(),
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function parseLimit(raw: string | null): number {
  if (!raw) return DEFAULT_LIMIT;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

function parseLocale(raw: string | null): "en" | "fr" {
  if (raw && LOCALES.has(raw)) return raw as "en" | "fr";
  return "en";
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = parseLocale(searchParams.get("locale"));
  const limit = parseLimit(searchParams.get("limit"));

  const siteUrl = getSiteUrl();
  const prefix = locale === "fr" ? "/fr" : "";
  const posts = (await getPublishedPosts(locale)).slice(0, limit);

  const articles = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    kind: post.kind,
    publishedAt: post.publishedAt,
    readingTime: post.readingTime,
    tags: post.tags ?? [],
    url: `${siteUrl}${prefix}/articles/${post.slug}`,
    coverImage: `${siteUrl}${post.coverImage}`,
  }));

  return NextResponse.json(
    { articles },
    {
      headers: {
        ...corsHeaders(),
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
