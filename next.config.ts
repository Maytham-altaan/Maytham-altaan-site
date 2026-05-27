import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/detector/:path*",
        destination: "https://detector.maytham-altaan.com/api/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
