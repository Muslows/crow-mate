import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // o2switch: venv has no @types; workers SIGABRT (RAM / old GLIBC). CI still runs tsc.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  productionBrowserSourceMaps: false,
  experimental: {
    webpackBuildWorker: false,
    webpackMemoryOptimizations: true,
    serverSourceMaps: false,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 200,
    preloadEntriesOnStart: false,
  },
  serverExternalPackages: [
    "discord.js",
    "discord-interactions",
    "@discordjs/ws",
    "@discordjs/rest",
    "@prisma/client",
    "prisma",
  ],
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false;
    }
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "zlib-sync": false,
      bufferutil: false,
      "utf-8-validate": false,
      erlpack: false,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d15f34w2p8l1cc.cloudfront.net",
        pathname: "/overwatch/**",
      },
    ],
  },
};

export default nextConfig;
