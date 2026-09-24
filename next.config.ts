import type { NextConfig } from "next";

const optionalNativeStubs = {
  "zlib-sync": "./lib/empty-native.js",
  bufferutil: "./lib/empty-native.js",
  "utf-8-validate": "./lib/empty-native.js",
  erlpack: "./lib/empty-native.js",
};

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "discord.js",
    "discord-interactions",
    "@discordjs/ws",
    "@discordjs/rest",
    "@prisma/client",
    "prisma",
  ],
  turbopack: {
    resolveAlias: optionalNativeStubs,
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      ...optionalNativeStubs,
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
