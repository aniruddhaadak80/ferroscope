import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// Standalone output powers the self-hosted Docker/Fly/Render images, but its
// traced-file copy needs symlink privileges that default Windows sessions do
// not grant — so Docker sets FERROSCOPE_STANDALONE=1 and desktop/CI/Vercel
// builds skip it.
const standalone = process.env.FERROSCOPE_STANDALONE === "1";
const projectRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(projectRoot, "..", "..");

const nextConfig: NextConfig = {
  ...(standalone
    ? {
        output: "standalone" as const,
        // The Docker image copies .next/standalone to /app, so server.js must
        // keep the monorepo shape (apps/web/server.js) rather than flattening.
        outputFileTracingRoot: repoRoot,
      }
    : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@ferroscope/core", "@ferroscope/seed", "@ferroscope/ui", "@ferroscope/sdk"],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  env: {
    NEXT_PUBLIC_SIM_SEED: process.env.NEXT_PUBLIC_SIM_SEED ?? "2718",
  },
};

export default nextConfig;
