import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Prevent Next.js from picking up a parent lockfile as the workspace root.
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
