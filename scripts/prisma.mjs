import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

function isTransactionPooler(url) {
  if (!url) return false;
  return /:6543(?:[/?]|$)/.test(url) || /pgbouncer=true/i.test(url);
}

function withConnectTimeout(url, seconds = 10) {
  if (!url || /connect_timeout=/i.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connect_timeout=${seconds}`;
}

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const args = process.argv.slice(2);
const isMigrateDeploy = args[0] === "migrate" && args[1] === "deploy";

if (isMigrateDeploy && process.env.VERCEL === "1") {
  console.warn(
    "Skipping prisma migrate deploy on Vercel (P1001: db host is IPv6-only). Run `npm run db:migrate:deploy` from a machine that can reach DIRECT_URL.",
  );
  process.exit(0);
}

if (isMigrateDeploy) {
  const migrateUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (isTransactionPooler(migrateUrl)) {
    console.error(
      "prisma migrate deploy cannot use the Supabase transaction pooler (:6543 / pgbouncer).\n" +
        "Set DIRECT_URL to the session mode URI on port 5432, then retry the deploy.",
    );
    process.exit(1);
  }
  process.env.DIRECT_URL = withConnectTimeout(process.env.DIRECT_URL);
  process.env.DATABASE_URL = withConnectTimeout(process.env.DATABASE_URL);
}

const bin = resolve("node_modules/.bin");
const pathKey = process.platform === "win32" ? "Path" : "PATH";
const env = {
  ...process.env,
  [pathKey]: `${bin}${process.platform === "win32" ? ";" : ":"}${process.env[pathKey] ?? ""}`,
};

const result = spawnSync("prisma", args, {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
  timeout: isMigrateDeploy ? 120_000 : undefined,
  killSignal: "SIGTERM",
});

if (result.error) {
  console.error(result.error);
}
if (isMigrateDeploy && result.signal === "SIGTERM" && result.status === null) {
  console.error("prisma migrate deploy timed out after 120s (database unreachable or lock wait).");
  process.exit(1);
}
process.exit(result.status ?? 1);
