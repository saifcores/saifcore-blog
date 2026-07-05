import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  experimental: {
    // CMS edits must show immediately — disable static router cache for prefetched pages.
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
