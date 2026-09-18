export const DEV_SESSION_COOKIE = "ow-dev-session";
export const DEV_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 14;

function sessionSecret(): string {
  return (
    process.env.BETTER_AUTH_SECRET?.trim() ||
    process.env.DIRECT_URL?.trim() ||
    "ow-manager-local-dev-session"
  );
}

function toB64Url(bytes: ArrayBuffer): string {
  const raw = new Uint8Array(bytes);
  let binary = "";
  for (const byte of raw) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hmacHex(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return toB64Url(signature);
}

function timingEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

export async function createDevSessionValue(userId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + DEV_SESSION_MAX_AGE_SEC;
  const body = `${userId}.${exp}`;
  const sig = await hmacHex(body);
  return `${body}.${sig}`;
}

export async function parseDevSessionUserId(
  value: string | undefined,
): Promise<string | null> {
  if (!value) return null;
  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const body = value.slice(0, lastDot);
  const sig = value.slice(lastDot + 1);
  const expDot = body.lastIndexOf(".");
  if (expDot <= 0) return null;
  const userId = body.slice(0, expDot);
  const exp = Number(body.slice(expDot + 1));
  if (!userId || !Number.isFinite(exp) || exp * 1000 < Date.now()) return null;
  const expected = await hmacHex(body);
  if (!timingEqual(expected, sig)) return null;
  return userId;
}

export function devSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: DEV_SESSION_MAX_AGE_SEC,
    secure: process.env.VERCEL === "1",
  };
}
