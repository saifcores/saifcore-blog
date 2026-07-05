import { NextResponse } from "next/server";
import {
  deleteAdminPost,
  getAdminPostPair,
  saveAdminPostPair,
} from "@/lib/posts-admin";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { ADMIN_LOCALES } from "@/lib/admin-constants";
import {
  contentStoreNotConfiguredMessage,
  isProductionWithoutContentStore,
} from "@/lib/content-store-config";
import { validateFrontmatter } from "@/lib/post-validation";
import { revalidateBlogContent } from "@/lib/revalidate-content";
import type { LocaleCode, PostFrontmatter } from "@/lib/types";

type LocalePayload = {
  frontmatter: PostFrontmatter;
  content: string;
  enabled?: boolean;
};

type UpdateBody = {
  locales: Partial<Record<LocaleCode, LocalePayload>>;
};

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  const { slug } = await context.params;
  const pair = await getAdminPostPair(slug);

  if (!pair.locales.en && !pair.locales.fr) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json(pair);
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  const { slug } = await context.params;

  // #region agent log
  const debugPayload = {
    slug,
    vercel: process.env.VERCEL === "1",
    githubConfigured: Boolean(
      process.env.GITHUB_TOKEN && process.env.GITHUB_REPO,
    ),
  };
  console.info("[cms-debug] PUT entry", debugPayload);
  fetch("http://127.0.0.1:7491/ingest/95632c63-416d-4373-aa76-e496270218b5", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "47c565",
    },
    body: JSON.stringify({
      sessionId: "47c565",
      location: "api/admin/posts/[slug]/route.ts:PUT:entry",
      message: "Article update started",
      data: debugPayload,
      timestamp: Date.now(),
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion

  if (isProductionWithoutContentStore()) {
    // #region agent log
    fetch("http://127.0.0.1:7491/ingest/95632c63-416d-4373-aa76-e496270218b5", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "47c565",
      },
      body: JSON.stringify({
        sessionId: "47c565",
        location: "api/admin/posts/[slug]/route.ts:PUT:no-store",
        message: "Blocked: no content store on Vercel",
        data: { slug },
        timestamp: Date.now(),
        hypothesisId: "A",
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json(
      { errors: [{ field: "_", message: contentStoreNotConfiguredMessage() }] },
      { status: 503 },
    );
  }

  const body = (await request.json()) as UpdateBody;

  const errors = [];
  for (const locale of ADMIN_LOCALES) {
    const payload = body.locales[locale];
    if (!payload || payload.enabled === false) continue;
    errors.push(...validateFrontmatter(payload.frontmatter, locale));
  }

  if (errors.length) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  for (const locale of ADMIN_LOCALES) {
    const payload = body.locales[locale];
    if (payload?.enabled === false) {
      const { deleteLocalePost } = await import("@/lib/posts-admin");
      await deleteLocalePost(locale, slug);
    }
  }

  const toSave: Partial<
    Record<LocaleCode, { frontmatter: PostFrontmatter; content: string }>
  > = {};

  for (const locale of ADMIN_LOCALES) {
    const payload = body.locales[locale];
    if (!payload || payload.enabled === false) continue;
    toSave[locale] = {
      frontmatter: payload.frontmatter,
      content: payload.content ?? "",
    };
  }

  if (!Object.keys(toSave).length) {
    return NextResponse.json(
      {
        errors: [{ field: "locales", message: "Enable at least one locale." }],
      },
      { status: 400 },
    );
  }

  try {
    await saveAdminPostPair(slug, toSave);
    revalidateBlogContent(slug);

    console.info("[cms-debug] PUT success", {
      slug,
      locales: Object.keys(toSave),
    });
    // #region agent log
    fetch("http://127.0.0.1:7491/ingest/95632c63-416d-4373-aa76-e496270218b5", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "47c565",
      },
      body: JSON.stringify({
        sessionId: "47c565",
        location: "api/admin/posts/[slug]/route.ts:PUT:success",
        message: "Article update persisted",
        data: { slug, locales: Object.keys(toSave) },
        timestamp: Date.now(),
        hypothesisId: "B",
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json({ ok: true, slug });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save article.";

    console.error("[cms-debug] PUT error", { slug, error: message });
    // #region agent log
    fetch("http://127.0.0.1:7491/ingest/95632c63-416d-4373-aa76-e496270218b5", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "47c565",
      },
      body: JSON.stringify({
        sessionId: "47c565",
        location: "api/admin/posts/[slug]/route.ts:PUT:error",
        message: "Article update failed",
        data: { slug, error: message },
        timestamp: Date.now(),
        hypothesisId: "C",
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json(
      { errors: [{ field: "_", message }] },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  if (isProductionWithoutContentStore()) {
    return NextResponse.json(
      { errors: [{ field: "_", message: contentStoreNotConfiguredMessage() }] },
      { status: 503 },
    );
  }

  const { slug } = await context.params;

  try {
    await deleteAdminPost(slug);
    revalidateBlogContent(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete article.";
    return NextResponse.json(
      { errors: [{ field: "_", message }] },
      { status: 500 },
    );
  }
}
