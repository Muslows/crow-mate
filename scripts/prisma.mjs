import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

function isTransactionPooler(url) {
  if (!url) return false;
  return /:6543(?:[/?]|$)/.test(url) || /pgbouncer=true/i.test(url);
}

function isSupabaseDirectHost(url) {
  return Boolean(url && /db\.[a-z0-9]+\.supabase\.co/i.test(url));
}

function withConnectTimeout(url, seconds = 15) {
  if (!url || /connect_timeout=/i.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connect_timeout=${seconds}`;
}

function toSupabaseSessionPoolerUrl(url) {
  if (!url) return null;
  if (!/pooler\.supabase\.com/i.test(url) && !/:6543(?:[/?]|$)/.test(url)) {
    return null;
  }
  return url
    .replace(/:6543(?=[/?]|$)/, ":5432")
    .replace(/[?&]pgbouncer=true/gi, "")
    .replace(/[?&]connection_limit=\d+/gi, "")
    .replace(/\?&/, "?")
    .replace(/[?&]$/, "");
}

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const args = process.argv.slice(2);
const isMigrateDeploy = args[0] === "migrate" && args[1] === "deploy";

if (isMigrateDeploy) {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL || databaseUrl;
  const sessionPooler =
    toSupabaseSessionPoolerUrl(databaseUrl) ||
    toSupabaseSessionPoolerUrl(directUrl);
  const vercelNeedsPooler =
    process.env.VERCEL === "1" &&
    (isSupabaseDirectHost(directUrl) || isTransactionPooler(directUrl));

  let migrateUrl = directUrl;
  if (sessionPooler && (vercelNeedsPooler || isTransactionPooler(migrateUrl))) {
    migrateUrl = sessionPooler;
    console.info(
      "[prisma] migrate deploy uses the Supabase session pooler (:5432), not the IPv6 direct host.",
    );
  }

  if (isTransactionPooler(migrateUrl)) {
    console.error(
      "prisma migrate deploy cannot use the Supabase transaction pooler (:6543 / pgbouncer).\n" +
        "Set DIRECT_URL to the session pooler on port 5432 (pooler.supabase.com:5432).",
    );
    process.exit(1);
  }

  process.env.DIRECT_URL = withConnectTimeout(migrateUrl);
  process.env.DATABASE_URL = withConnectTimeout(databaseUrl);
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
  timeout: isMigrateDeploy ? 180_000 : undefined,
  killSignal: "SIGTERM",
});

if (result.error) {
  console.error(result.error);
}
if (isMigrateDeploy && result.signal === "SIGTERM" && result.status === null) {
  console.error(
    "prisma migrate deploy timed out after 180s (database unreachable or lock wait).",
  );
  process.exit(1);
}
process.exit(result.status ?? 1);
