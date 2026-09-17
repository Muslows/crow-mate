#!/usr/bin/env node
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { applyLocalDotEnv } from "./dotenv.mjs";

applyLocalDotEnv();

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("usage: node scripts/with-local-env.mjs <command> [...args]");
  process.exit(1);
}

const bin = resolve("node_modules/.bin");
const pathKey = process.platform === "win32" ? "Path" : "PATH";
const env = {
  ...process.env,
  [pathKey]: `${bin}${process.platform === "win32" ? ";" : ":"}${process.env[pathKey] ?? ""}`,
};

const child = spawn(command, args, {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
