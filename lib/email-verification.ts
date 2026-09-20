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

export function signupNeedsOrphanCheck(
  user: { identities?: unknown[] | null } | null | undefined,
): boolean {
  return Boolean(user) && (user?.identities?.length ?? 0) === 0;
}

export function isAlreadyRegisteredAuthError(error: {
  code?: string | null;
  message?: string | null;
} | null): boolean {
  if (!error) return false;
  const code = error.code?.trim().toLowerCase() ?? "";
  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    code === "identity_already_exists"
  ) {
    return true;
  }
  const message = error.message?.trim().toLowerCase() ?? "";
  return (
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("email exists")
  );
}
