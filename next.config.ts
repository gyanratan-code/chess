import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    // Add `src/assets` to the module resolution
    config.resolve.modules.push(path.resolve("./src"));
    return config;
  },
  // adding cache for sounds effect
  async headers() {
    return [
      {
        source: "/sounds/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // Cache for 1 year
          },
        ],
      },
    ];
  },
};

export default nextConfig;
