import { NextResponse } from "next/server";
import { getAllAdminPosts, saveAdminPostPair } from "@/lib/posts-admin";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { ADMIN_LOCALES } from "@/lib/admin-constants";
import { validateFrontmatter, validateSlug } from "@/lib/post-validation";
import { revalidateBlogContent } from "@/lib/revalidate-content";
import type { LocaleCode, PostFrontmatter } from "@/lib/types";
import { getPostSlugs } from "@/lib/posts";

type LocalePayload = {
  frontmatter: PostFrontmatter;
  content: string;
  enabled?: boolean;
};

type CreateBody = {
  slug: string;
  locales: Partial<Record<LocaleCode, LocalePayload>>;
};

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  return NextResponse.json({ posts: getAllAdminPosts() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  const body = (await request.json()) as CreateBody;
  const slugError = validateSlug(body.slug);
  if (slugError) {
    return NextResponse.json({ errors: [slugError] }, { status: 400 });
  }

  for (const locale of ADMIN_LOCALES) {
    if (getPostSlugs(locale).includes(body.slug)) {
      return NextResponse.json(
        { errors: [{ field: "slug", message: "Slug already exists." }] },
        { status: 409 },
      );
    }
  }

  const errors = collectLocaleErrors(body.locales);
  if (errors.length) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const toSave = normalizeLocales(body.locales);
  if (!Object.keys(toSave).length) {
    return NextResponse.json(
      {
        errors: [{ field: "locales", message: "Enable at least one locale." }],
      },
      { status: 400 },
    );
  }

  saveAdminPostPair(body.slug, toSave);
  revalidateBlogContent(body.slug);

  return NextResponse.json({ ok: true, slug: body.slug });
}

function collectLocaleErrors(
  locales: Partial<Record<LocaleCode, LocalePayload>>,
) {
  const errors = [];

  for (const locale of ADMIN_LOCALES) {
    const payload = locales[locale];
    if (!payload || payload.enabled === false) continue;
    errors.push(...validateFrontmatter(payload.frontmatter, locale));
  }

  return errors;
}

function normalizeLocales(
  locales: Partial<Record<LocaleCode, LocalePayload>>,
): Partial<
  Record<LocaleCode, { frontmatter: PostFrontmatter; content: string }>
> {
  const result: Partial<
    Record<LocaleCode, { frontmatter: PostFrontmatter; content: string }>
  > = {};

  for (const locale of ADMIN_LOCALES) {
    const payload = locales[locale];
    if (!payload || payload.enabled === false) continue;
    result[locale] = {
      frontmatter: payload.frontmatter,
      content: payload.content ?? "",
    };
  }

  return result;
}
