import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["pino", "thread-stream", "pino-pretty"],
};

export default nextConfig;
