import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

function hostToOrigin(host: string | undefined): string | null {
  if (!host) return null;
  if (host.startsWith("http://") || host.startsWith("https://")) {
    return host.replace(/\/$/, "");
  }
  return `https://${host.replace(/\/$/, "")}`;
}

function publicAppUrl(): string {
  const configured = process.env.BETTER_AUTH_URL?.replace(/\/$/, "");
  if (configured && !configured.includes("localhost")) return configured;
  const production = hostToOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (production) return production;
  const deployment = hostToOrigin(process.env.VERCEL_URL);
  if (deployment) return deployment;
  return configured ?? "http://localhost:3000";
}

function authOrigins(): string[] {
  const origins = new Set([
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "https://*.vercel.app",
    publicAppUrl(),
  ]);
  for (const host of [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    const origin = hostToOrigin(host);
    if (origin) origins.add(origin);
  }
  const extra = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  if (extra) {
    for (const origin of extra.split(",")) {
      const trimmed = origin.trim().replace(/\/$/, "");
      if (trimmed) origins.add(trimmed);
    }
  }
  return [...origins];
}

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: publicAppUrl(),
  trustedOrigins: authOrigins(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: ["PLAYER", "MANAGER", "COACH", "CASTER", "STAFF", "ADMIN"],
        required: false,
        defaultValue: "PLAYER",
        input: false,
      },
      isManager: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      isPlayer: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      isCoach: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      isCaster: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      isStaff: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      openToCast: {
        type: ["CLOSED", "OPEN"],
        required: false,
        defaultValue: "CLOSED",
        input: false,
      },
      openToCoach: {
        type: ["CLOSED", "OPEN"],
        required: false,
        defaultValue: "CLOSED",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: "PLAYER",
              isManager: false,
              isPlayer: true,
              isCoach: false,
              isCaster: false,
              isStaff: false,
              openToCast: "CLOSED",
              openToCoach: "CLOSED",
            },
          };
        },
        after: async (user) => {
          await db.playerProfile.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              sr: 0,
              role: "TANK",
              favoriteHeroes: [],
              experience: "",
            },
            update: {},
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
