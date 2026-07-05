import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getGithubUrl, getLinkedinUrl, getPortfolioUrl } from "@/site";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();
  const portfolioUrl = getPortfolioUrl();

  return (
    <footer className="border-t border-[var(--border-subtle)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-bold tracking-tight">
              <span className="text-[var(--text-primary)]">SAIF</span>
              <span className="text-gradient">CORE</span>
              <span className="text-[var(--text-muted)]"> Blog</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
              {t("tagline")}
            </p>
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              {t("rights", { year })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:flex sm:flex-wrap sm:gap-12 md:gap-16">
            <nav aria-label={t("exploreLabel")}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {t("exploreLabel")}
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    href="/"
                    className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  >
                    {t("articles")}
                  </Link>
                </li>
                <li>
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  >
                    {t("portfolio")}
                  </a>
                </li>
              </ul>
            </nav>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {t("connectLabel")}
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a
                    href={getLinkedinUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  >
                    {t("linkedin")}
                  </a>
                </li>
                <li>
                  <a
                    href={getGithubUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  >
                    {t("github")}
                  </a>
                </li>
                <li>
                  <a
                    href="/feed.xml"
                    className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  >
                    {t("rss")} (EN)
                  </a>
                </li>
                <li>
                  <a
                    href="/fr/feed.xml"
                    className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  >
                    {t("rss")} (FR)
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
