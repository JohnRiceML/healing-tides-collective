import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The E2E webServer serves the app at 127.0.0.1; allow it as a dev origin so Next's
  // dev-resource cross-origin guard doesn't warn/block during the Playwright run.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
