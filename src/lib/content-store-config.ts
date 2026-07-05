import { isGitHubContentStoreEnabled } from "./github-content";

/** True when running on Vercel (or similar) without a writable content backend. */
export function isProductionWithoutContentStore(): boolean {
  return process.env.VERCEL === "1" && !isGitHubContentStoreEnabled();
}

export function contentStoreNotConfiguredMessage(): string {
  return (
    "CMS writes require GITHUB_TOKEN and GITHUB_REPO on Vercel. " +
    "The server filesystem is read-only in production."
  );
}
