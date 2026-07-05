export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function getPortfolioUrl(): string {
  const raw = process.env.NEXT_PUBLIC_PORTFOLIO_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }
  return "https://saifcore.tech";
}

export function getLinkedinUrl(): string {
  const u = process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim();
  return u && /^https?:\/\//i.test(u) ? u : "https://www.linkedin.com";
}

export function getGithubUrl(): string {
  const u = process.env.NEXT_PUBLIC_GITHUB_URL?.trim();
  return u && /^https?:\/\//i.test(u) ? u : "https://github.com";
}

export function getCalendlyUrl(): string | null {
  const u = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim();
  if (!u) return null;
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "https:") return null;
    if (parsed.hostname.replace(/^www\./, "") !== "calendly.com") {
      return null;
    }
    return u.replace(/\/$/, "");
  } catch {
    return null;
  }
}
