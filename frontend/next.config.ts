import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  serverExternalPackages: [
    "pino",
    "pino-std-serializers",
    "thread-stream",
    "sonic-boom",
  ],
};

export default nextConfig;
