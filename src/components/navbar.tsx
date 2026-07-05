import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { getCalendlyUrl, getPortfolioUrl } from "@/site";

export async function Navbar() {
  const t = await getTranslations("nav");
  const portfolioUrl = getPortfolioUrl();
  const calendlyUrl = getCalendlyUrl();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="page-container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[var(--text-primary)] transition hover:opacity-90"
          aria-label="SAIFCORE Blog — home"
        >
          <Image
            src="/profile.png"
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-[var(--border-subtle)] sm:h-9 sm:w-9"
            priority
            sizes="36px"
          />
          <span className="text-sm font-bold tracking-tight">
            <span className="text-[var(--text-primary)]">SAIF</span>
            <span className="text-gradient">CORE</span>
            <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Blog
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-5 md:flex"
          aria-label={t("primary")}
        >
          <Link
            href="/"
            className="text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            {t("articles")}
          </Link>
          <a
            href={portfolioUrl}
            className="text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("portfolio")}
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSwitcher
            navLabel={t("language")}
            labels={{ en: t("localeEn"), fr: t("localeFr") }}
          />
          <ThemeToggle />
          {calendlyUrl ? (
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary hidden px-3 py-2 text-xs md:inline-flex xl:px-4 xl:text-sm"
            >
              {t("bookCall")}
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
