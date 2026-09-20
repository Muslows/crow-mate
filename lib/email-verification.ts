export function requireEmailVerification(): boolean {
  if (process.env.VERCEL === "1") return true;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host !== "localhost" && host !== "127.0.0.1" && host !== "::1";
  }
  return false;
}

export function isLocalAppRuntime(): boolean {
  return process.env.VERCEL !== "1";
}

export function signupEmailRedirectTo(origin: string): string {
  return `${origin.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent(
    "/auth/email-confirmed?next=/profile/settings",
  )}`;
}

export function isDuplicateSignUpUser(
  user: { identities?: unknown[] | null } | null | undefined,
): boolean {
  return Boolean(user) && (user?.identities?.length ?? 0) === 0;
}
