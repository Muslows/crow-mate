import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

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
