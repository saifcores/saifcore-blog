import fs from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import {
  deleteGitHubMdx,
  isGitHubContentStoreEnabled,
  listGitHubMdxSlugs,
  readGitHubMdx,
  writeGitHubMdx,
} from "./github-content";

const contentRoot = path.join(process.cwd(), "content");

function localeDir(locale: string): string {
  return path.join(contentRoot, locale);
}

function readFilesystemMdx(locale: string, slug: string): string | null {
  const filePath = path.join(localeDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

function listFilesystemSlugs(locale: string): string[] {
  const dir = localeDir(locale);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

const cachedGitHubMdx = unstable_cache(
  async (locale: string, slug: string) => readGitHubMdx(locale, slug),
  ["github-mdx-file"],
  { tags: ["github-mdx"] },
);

const cachedGitHubSlugs = unstable_cache(
  async (locale: string) => listGitHubMdxSlugs(locale),
  ["github-mdx-slugs"],
  { tags: ["github-mdx-list"] },
);

export async function readMdxSource(
  locale: string,
  slug: string,
): Promise<string | null> {
  if (isGitHubContentStoreEnabled()) {
    return cachedGitHubMdx(locale, slug);
  }
  return readFilesystemMdx(locale, slug);
}

export async function listMdxSlugs(locale: string): Promise<string[]> {
  if (isGitHubContentStoreEnabled()) {
    return cachedGitHubSlugs(locale);
  }
  return listFilesystemSlugs(locale);
}

export function writeMdxSource(
  locale: string,
  slug: string,
  raw: string,
): void {
  const dir = localeDir(locale);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${slug}.mdx`), raw, "utf8");
}

export async function persistMdxSource(
  locale: string,
  slug: string,
  raw: string,
  message: string,
): Promise<void> {
  if (isGitHubContentStoreEnabled()) {
    await writeGitHubMdx(locale, slug, raw, message);
    return;
  }

  writeMdxSource(locale, slug, raw);
}

export async function removeMdxSource(
  locale: string,
  slug: string,
  message: string,
): Promise<boolean> {
  if (isGitHubContentStoreEnabled()) {
    return deleteGitHubMdx(locale, slug, message);
  }

  const filePath = path.join(localeDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

export function readMdxSourceSync(locale: string, slug: string): string | null {
  return readFilesystemMdx(locale, slug);
}

export function listMdxSlugsSync(locale: string): string[] {
  return listFilesystemSlugs(locale);
}
