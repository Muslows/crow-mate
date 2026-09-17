import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Load `.env` into process.env.
 * Off Vercel, file values win so a leftover Vercel/Supabase DATABASE_URL
 * in the shell cannot hijack local Prisma / Next.
 */
export function applyDotEnv({ override } = { override: false }) {
  try {
    const text = readFileSync(resolve(".env"), "utf8");
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (override || process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional on Vercel
  }
  process.env.DIRECT_URL ??= process.env.DATABASE_URL;
}

export function applyLocalDotEnv() {
  applyDotEnv({ override: process.env.VERCEL !== "1" });
}
