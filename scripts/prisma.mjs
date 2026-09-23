import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isHostedDeploy } from "./dotenv.mjs";

function isTransactionPooler(url) {
  if (!url) return false;
  return /:6543(?:[/?]|$)/.test(url) || /pgbouncer=true/i.test(url);
}

function withConnectTimeout(url, seconds = 15) {
  if (!url || /connect_timeout=/i.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connect_timeout=${seconds}`;
}

const args = process.argv.slice(2);
const isMigrateDeploy = args[0] === "migrate" && args[1] === "deploy";

if (
  isMigrateDeploy &&
  (isHostedDeploy() || process.env.SKIP_PRISMA_MIGRATE === "1")
) {
  console.warn(
    "Skipping prisma migrate deploy on this host (port 5432 is blocked). Schema is patched at runtime. Run `npm run db:migrate:deploy` on your machine.",
  );
  process.exit(0);
}

if (isMigrateDeploy) {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL || "";
  if (isTransactionPooler(directUrl || databaseUrl) && !directUrl) {
    console.error(
      "prisma migrate deploy cannot use DATABASE_URL on :6543.\n" +
        "On your machine only, set DIRECT_URL to the Session pooler (:5432) or db.<ref>.supabase.co, then retry.",
    );
    process.exit(1);
  }
  if (directUrl) process.env.DIRECT_URL = withConnectTimeout(directUrl);
  if (databaseUrl) process.env.DATABASE_URL = withConnectTimeout(databaseUrl);
}

const require = createRequire(fileURLToPath(import.meta.url));
const prismaCli = require.resolve("prisma/build/index.js");
const bin = resolve("node_modules/.bin");
const pathKey = process.platform === "win32" ? "Path" : "PATH";
const env = {
  ...process.env,
  [pathKey]: `${bin}${process.platform === "win32" ? ";" : ":"}${process.env[pathKey] ?? ""}`,
};

const result = spawnSync(process.execPath, [prismaCli, ...args], {
  stdio: "inherit",
  env,
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
