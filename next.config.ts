import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    // Add `src/assets` to the module resolution
    config.resolve.modules.push(path.resolve("./src"));
    return config;
  },
};

export default nextConfig;
