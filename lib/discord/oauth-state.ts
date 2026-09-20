import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { discordOAuthStateSchema } from "@/lib/validations/discord";

export const DISCORD_OAUTH_COOKIE = "ow_discord_oauth_nonce";
export const DISCORD_OAUTH_TTL_MS = 10 * 60 * 1000;

export function discordOAuthCookieOptions(secure: boolean, maxAge = DISCORD_OAUTH_TTL_MS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: Math.floor(maxAge / 1000),
  };
}

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createDiscordOAuthState(input: {
  userId: string;
  secret: string;
  intent?: "identify" | "guild";
  teamId?: string;
}) {
  const nonce = randomBytes(16).toString("hex");
  const data = {
    userId: input.userId,
    nonce,
    expiresAt: Date.now() + DISCORD_OAUTH_TTL_MS,
    ...(input.intent ? { intent: input.intent } : {}),
    ...(input.teamId ? { teamId: input.teamId } : {}),
  };
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return {
    state: nonce,
    cookieValue: `${payload}.${signature(payload, input.secret)}`,
  };
}

export function verifyDiscordOAuthState(
  cookieValue: string | undefined,
  queryState: string,
  secret: string,
) {
  if (!cookieValue) return null;
  let value = cookieValue;
  try {
    value = decodeURIComponent(cookieValue);
  } catch {
    // Cookie is already decoded by the runtime.
  }
  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const payload = value.slice(0, lastDot);
  const suppliedSignature = value.slice(lastDot + 1);
  if (!payload || !suppliedSignature) return null;
  const expectedSignature = signature(payload, secret);
  const expected = Buffer.from(expectedSignature);
  const supplied = Buffer.from(suppliedSignature);
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    return null;
  }
  try {
    const parsed = discordOAuthStateSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
    if (!parsed.success || parsed.data.expiresAt < Date.now()) return null;
    if (queryState && parsed.data.nonce !== queryState) return null;
    return parsed.data;
  } catch {
    return null;
  }
}
