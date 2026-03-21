import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // disabled to avoid _buildManifest.js.tmp ENOENT bug
  },
};

export default nextConfig;
