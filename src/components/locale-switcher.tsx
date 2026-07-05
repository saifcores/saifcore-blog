"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Props = {
  labels: { en: string; fr: string };
  navLabel: string;
};

export function LocaleSwitcher({ labels, navLabel }: Props) {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 p-0.5 text-[11px] font-medium sm:gap-1 sm:text-xs"
      role="navigation"
      aria-label={navLabel}
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            className={`rounded-lg px-2 py-1 transition sm:px-2.5 sm:py-1.5 ${
              active
                ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-card)] ring-1 ring-[var(--border-subtle)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]/60 hover:text-[var(--text-primary)]"
            }`}
            hrefLang={loc}
          >
            {loc === "en" ? labels.en : labels.fr}
          </Link>
        );
      })}
    </div>
  );
}
