type GitHubContentFile = {
  name: string;
  path: string;
  sha: string;
  content?: string;
  encoding?: string;
};

function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";

  if (!token || !repo) return null;

  const [owner, name] = repo.split("/");
  if (!owner || !name) return null;

  return { token, owner, name, branch };
}

export function isGitHubContentStoreEnabled(): boolean {
  return getGitHubConfig() !== null;
}

async function githubRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getGitHubConfig();
  if (!config) {
    throw new Error("GitHub content store is not configured.");
  }

  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub API ${response.status}: ${detail}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function mdxPath(locale: string, slug: string): string {
  return `content/${locale}/${slug}.mdx`;
}

function encodeRepoPath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export async function readGitHubMdx(
  locale: string,
  slug: string,
): Promise<string | null> {
  const config = getGitHubConfig();
  if (!config) return null;

  const path = mdxPath(locale, slug);

  try {
    const file = await githubRequest<GitHubContentFile>(
      `/repos/${config.owner}/${config.name}/contents/${encodeRepoPath(path)}?ref=${encodeURIComponent(config.branch)}`,
    );

    if (!file.content || file.encoding !== "base64") {
      return null;
    }

    return Buffer.from(file.content, "base64").toString("utf8");
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

export async function listGitHubMdxSlugs(locale: string): Promise<string[]> {
  const config = getGitHubConfig();
  if (!config) return [];

  const dirPath = `content/${locale}`;

  try {
    const entries = await githubRequest<GitHubContentFile[]>(
      `/repos/${config.owner}/${config.name}/contents/${encodeRepoPath(dirPath)}?ref=${encodeURIComponent(config.branch)}`,
    );

    return entries
      .filter((entry) => entry.name.endsWith(".mdx"))
      .map((entry) => entry.name.replace(/\.mdx$/, ""))
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return [];
    }
    throw error;
  }
}

export async function writeGitHubMdx(
  locale: string,
  slug: string,
  raw: string,
  message: string,
): Promise<void> {
  const config = getGitHubConfig();
  if (!config) {
    throw new Error("GitHub content store is not configured.");
  }

  const path = mdxPath(locale, slug);
  let sha: string | undefined;

  try {
    const existing = await githubRequest<GitHubContentFile>(
      `/repos/${config.owner}/${config.name}/contents/${encodeRepoPath(path)}?ref=${encodeURIComponent(config.branch)}`,
    );
    sha = existing.sha;
  } catch (error) {
    if (!(error instanceof Error && error.message.includes("404"))) {
      throw error;
    }
  }

  await githubRequest(
    `/repos/${config.owner}/${config.name}/contents/${encodeRepoPath(path)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: Buffer.from(raw, "utf8").toString("base64"),
        branch: config.branch,
        ...(sha ? { sha } : {}),
      }),
    },
  );
}

export async function deleteGitHubMdx(
  locale: string,
  slug: string,
  message: string,
): Promise<boolean> {
  const config = getGitHubConfig();
  if (!config) {
    throw new Error("GitHub content store is not configured.");
  }

  const path = mdxPath(locale, slug);

  let sha: string;
  try {
    const existing = await githubRequest<GitHubContentFile>(
      `/repos/${config.owner}/${config.name}/contents/${encodeRepoPath(path)}?ref=${encodeURIComponent(config.branch)}`,
    );
    sha = existing.sha;
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return false;
    }
    throw error;
  }

  await githubRequest(
    `/repos/${config.owner}/${config.name}/contents/${encodeRepoPath(path)}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        sha,
        branch: config.branch,
      }),
    },
  );

  return true;
}
