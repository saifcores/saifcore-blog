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

function tokenKind(token: string): string {
  if (token.startsWith("github_pat_")) return "fine-grained";
  if (token.startsWith("ghp_")) return "classic";
  if (token.startsWith("gho_")) return "oauth";
  return "unknown";
}

function formatGitHubApiError(
  status: number,
  detail: string,
  operation: string,
): string {
  if (status === 403 && detail.includes("Resource not accessible")) {
    return (
      `GitHub rejected the ${operation} request: your token cannot write ` +
      `repository contents. Create a new PAT with Contents read/write on ` +
      `GITHUB_REPO (fine-grained) or the repo scope (classic). If the repo ` +
      `is in an organization, authorize the token for SSO under GitHub ` +
      `Settings → Personal access tokens. Raw: ${detail}`
    );
  }

  return `GitHub API ${status} (${operation}): ${detail}`;
}

export function isGitHubContentStoreEnabled(): boolean {
  return getGitHubConfig() !== null;
}

export const GITHUB_WRITE_SETUP_HINT =
  "Create a PAT with Contents read/write on GITHUB_REPO (fine-grained) or " +
  "the repo scope (classic). For org repos like saifcores/*, set Resource " +
  "owner to the organization (saifcores), not your personal account. " +
  "Authorize the token for SSO under GitHub Settings → Personal access tokens.";

type GitHubRepoMeta = {
  permissions?: {
    pull?: boolean;
    push?: boolean;
    admin?: boolean;
  };
};

export type GitHubCmsDiagnostics = {
  configured: boolean;
  repo?: string;
  branch?: string;
  tokenKind?: string;
  canRead?: boolean;
  canPush?: boolean;
  canWriteContents?: boolean;
  readyForCmsWrites: boolean;
  issues: string[];
};

export async function getGitHubCmsDiagnostics(): Promise<GitHubCmsDiagnostics> {
  const config = getGitHubConfig();
  if (!config) {
    return {
      configured: false,
      readyForCmsWrites: false,
      issues: ["GITHUB_TOKEN and GITHUB_REPO are not set."],
    };
  }

  const repo = `${config.owner}/${config.name}`;
  const issues: string[] = [];

  try {
    const meta = await githubRequest<GitHubRepoMeta>(
      `/repos/${config.owner}/${config.name}`,
      undefined,
      "check repository access",
    );

    const canRead = meta.permissions?.pull === true;
    const canPush = meta.permissions?.push === true;

    if (!canRead) {
      issues.push(
        "Token cannot read the repository (missing pull/Contents read).",
      );
    }
    if (!canPush) {
      issues.push(
        "Token cannot push to the repository (missing Contents write or repo scope).",
      );
      issues.push(GITHUB_WRITE_SETUP_HINT);
    }

    let canWriteContents: boolean | undefined;
    if (canRead) {
      const probe = await probeContentsWrite();
      canWriteContents = probe.ok;
      if (!probe.ok) {
        issues.push(
          probe.error ??
            "Contents API write probe failed (PUT returned an error).",
        );
        if (canPush) {
          issues.push(
            "Repository metadata shows push access, but Contents API writes " +
              "still fail. For org-owned repos, recreate the token with " +
              "Resource owner = saifcores and Contents Read and write.",
          );
        }
        issues.push(GITHUB_WRITE_SETUP_HINT);
      }
    }

    return {
      configured: true,
      repo,
      branch: config.branch,
      tokenKind: tokenKind(config.token),
      canRead,
      canPush,
      canWriteContents,
      readyForCmsWrites: canWriteContents === true,
      issues,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    issues.push(message);
    if (message.includes("403")) {
      issues.push(GITHUB_WRITE_SETUP_HINT);
    }

    return {
      configured: true,
      repo,
      branch: config.branch,
      tokenKind: tokenKind(config.token),
      readyForCmsWrites: false,
      issues,
    };
  }
}

export async function assertGitHubWriteAccess(): Promise<void> {
  if (!isGitHubContentStoreEnabled()) return;

  const diagnostics = await getGitHubCmsDiagnostics();
  if (diagnostics.readyForCmsWrites) return;

  const detail = diagnostics.issues.join(" ");
  throw new Error(`GitHub token is not ready for CMS writes. ${detail}`);
}

async function githubRequest<T>(
  path: string,
  init?: RequestInit,
  operation = "request",
): Promise<T> {
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
    throw new Error(formatGitHubApiError(response.status, detail, operation));
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

/** PUT the same file content back to verify Contents API write access. */
async function probeContentsWrite(): Promise<{ ok: boolean; error?: string }> {
  const config = getGitHubConfig();
  if (!config) return { ok: false, error: "GitHub is not configured." };

  try {
    const slugs = await listGitHubMdxSlugs("en");
    const slug = slugs[0];
    if (!slug) {
      return {
        ok: false,
        error: "No EN MDX files found to probe write access.",
      };
    }

    const filePath = mdxPath("en", slug);
    const existing = await githubRequest<GitHubContentFile>(
      `/repos/${config.owner}/${config.name}/contents/${encodeRepoPath(filePath)}?ref=${encodeURIComponent(config.branch)}`,
      undefined,
      "probe read file",
    );

    if (!existing.content || !existing.sha) {
      return { ok: false, error: "Could not read probe file from GitHub." };
    }

    await githubRequest(
      `/repos/${config.owner}/${config.name}/contents/${encodeRepoPath(filePath)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "cms: write access probe",
          content: existing.content,
          branch: config.branch,
          sha: existing.sha,
        }),
      },
      "probe write file",
    );

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
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
      undefined,
      "read file",
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
      undefined,
      "list directory",
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
      undefined,
      "read file for update",
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
    "write file",
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
      undefined,
      "read file for delete",
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
    "delete file",
  );

  return true;
}
