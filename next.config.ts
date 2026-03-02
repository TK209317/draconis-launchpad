import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // ✅ NEW
  reactCompiler: true,
  //serverExternalPackages: ["pino", "thread-stream", "pino-pretty"],

  // 新加這段，讓 server actions 讀到 DATABASE_URL
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;