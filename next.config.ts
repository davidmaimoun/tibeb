import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Standalone output keeps the production image small for PM2 + nginx deploys.
  output: "standalone",
  images: {
    // Local images in /public need no config. Add remote hosts here only if you
    // serve images from a CDN via next/image.
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
