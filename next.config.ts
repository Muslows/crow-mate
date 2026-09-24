import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "discord.js",
    "discord-interactions",
    "@discordjs/ws",
    "@discordjs/rest",
    "@prisma/client",
    "prisma",
  ],
  webpack: (config) => {
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
