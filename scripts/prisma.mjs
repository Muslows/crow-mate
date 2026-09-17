import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const bin = resolve("node_modules/.bin");
const pathKey = process.platform === "win32" ? "Path" : "PATH";
const env = {
  ...process.env,
  [pathKey]: `${bin}${process.platform === "win32" ? ";" : ":"}${process.env[pathKey] ?? ""}`,
};

const result = spawnSync("prisma", process.argv.slice(2), {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(result.error);
}
process.exit(result.status ?? 1);
