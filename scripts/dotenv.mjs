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
      if (value.startsWith('"')) {
        const end = value.indexOf('"', 1);
        value = end === -1 ? value.slice(1) : value.slice(1, end);
      } else if (value.startsWith("'")) {
        const end = value.indexOf("'", 1);
        value = end === -1 ? value.slice(1) : value.slice(1, end);
      } else {
        const comment = value.search(/\s+#/);
        if (comment !== -1) value = value.slice(0, comment).trim();
      }
      if (override || process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional on Vercel
  }
}

export function applyLocalDotEnv() {
  const keepRemote =
    process.env.VERCEL === "1" || process.env.USE_REMOTE_DB === "1";
  applyDotEnv({ override: !keepRemote });
}
