import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: sibling repos live under a shared parent that may
  // carry a lockfile, which Next would otherwise infer as the workspace root.
  turbopack: { root: __dirname },
};

export default nextConfig;
