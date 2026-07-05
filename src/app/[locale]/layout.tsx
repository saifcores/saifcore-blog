import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { hasLocale, type Locale } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";
import { DEFAULT_OG_IMAGE } from "@/seo";
import { getSiteUrl } from "@/site";

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#f0f2f6" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "meta",
  });

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("title"),
      template: "%s | SAIFCORE Blog",
    },
    description: t("description"),
    applicationName: "SAIFCORE Blog",
    icons: {
      icon: [{ url: "/icon.png", sizes: "32x32", type: "image/png" }],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      siteName: "SAIFCORE Blog",
      type: "website",
      images: [
        { url: DEFAULT_OG_IMAGE, width: 800, height: 800, alt: "SAIFCORE" },
      ],
    },
    twitter: {
      card: "summary",
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: {
      types: {
        "application/rss+xml": [
          { url: "/feed.xml", title: "SAIFCORE Blog RSS (EN)" },
          { url: "/fr/feed.xml", title: "SAIFCORE Blog RSS (FR)" },
        ],
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const tCommon = await getTranslations("common");

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var p=localStorage.getItem("theme");if(p!=="light"&&p!=="dark"&&p!=="system")p="system";var r=p;if(p==="system")r=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.dataset.theme=r;document.documentElement.dataset.themePreference=p;}catch(e){}})();`,
        }}
      />
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider>
          <a
            href="#main-content"
            className="fixed left-4 top-4 z-100 -translate-y-16 rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-semibold text-white opacity-0 transition focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            {tCommon("skipToContent")}
          </a>
          <div className="flex min-h-full flex-col">
            <Navbar />
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </NextIntlClientProvider>
      <Analytics />
    </>
  );
}
