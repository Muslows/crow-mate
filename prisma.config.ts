import { defineConfig } from "prisma/config";
import { applyLocalDotEnv } from "./scripts/dotenv.mjs";

applyLocalDotEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
