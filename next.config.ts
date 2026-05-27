import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxy detector API calls to the backend. We use the .vercel.app
        // URL directly (instead of the subdomain) because the subdomain is
        // now redirected to /ai-detector at the host level, and we don't
        // want this proxy to loop into that redirect.
        source: "/api/detector/:path*",
        destination: "https://altaan-detector.vercel.app/api/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        // When someone visits any path on detector.maytham-altaan.com,
        // bounce them to the full website's ai-detector page so they get
        // the nav, ticker, footer, and the native detector embedded.
        source: "/:path*",
        has: [{ type: "host", value: "detector.maytham-altaan.com" }],
        destination: "https://maytham-altaan.com/en/ai-detector",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
