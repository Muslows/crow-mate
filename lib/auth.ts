import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

function signupRole(value: unknown): "MANAGER" | "PLAYER" {
  return value === "PLAYER" ? "PLAYER" : "MANAGER";
}

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: ["MANAGER", "PLAYER", "ADMIN"],
        required: false,
        defaultValue: "MANAGER",
        input: true,
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
        defaultValue: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = signupRole(user.role);
          return {
            data: {
              ...user,
              role,
              isManager: role === "MANAGER",
              isPlayer: role === "PLAYER",
            },
          };
        },
        after: async (user) => {
          if (user.role !== "PLAYER") return;
          await db.playerProfile.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              sr: 0,
              primaryRole: "DPS",
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
