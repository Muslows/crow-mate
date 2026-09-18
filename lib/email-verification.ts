export function requireEmailVerification(): boolean {
  return true;
}

export function isLocalAppRuntime(): boolean {
  return process.env.VERCEL !== "1";
}
