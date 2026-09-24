import { defineConfig } from "prisma/config";
import { applyLocalDotEnv } from "./scripts/dotenv.mjs";

applyLocalDotEnv();

const url = process.env.DATABASE_URL ?? "";
const directUrl = process.env.DIRECT_URL ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url,
    ...(directUrl ? { directUrl } : {}),
  },
});
