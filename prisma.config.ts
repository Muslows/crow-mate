import { defineConfig } from "prisma/config";
import { applyLocalDotEnv, isHostedDeploy } from "./scripts/dotenv.mjs";

applyLocalDotEnv();

function isSessionPooler(url: string) {
  return /pooler\.supabase\.com:5432/i.test(url);
}

function isUsableDirectUrl(url: string) {
  if (!url) return false;
  if (isHostedDeploy() && isSessionPooler(url)) return false;
  return (
    /localhost|127\.0\.0\.1/i.test(url) ||
    /db\.[a-z0-9]+\.supabase\.co/i.test(url) ||
    isSessionPooler(url)
  );
}

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
    ...(isUsableDirectUrl(directUrl) ? { directUrl } : {}),
  },
});
