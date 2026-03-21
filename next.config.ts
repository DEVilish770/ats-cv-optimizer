import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for pdf-parse to work in serverless functions
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
