"use server";

import { isAdmin } from "@/lib/admin";
import { homePathForRole } from "@/lib/roles";
import { getSession, sessionCapabilities } from "@/lib/session";

function safeInternalPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/login") || value.startsWith("/register")) return null;
  return value;
}

export async function resolveLoginRedirect(
  nextParam: string | null,
): Promise<string> {
  const session = await getSession();
  if (!session) return "/login";

  const fallback = homePathForRole(sessionCapabilities(session));
  const next = safeInternalPath(nextParam);
  if (!next) return fallback;
  if (next.startsWith("/admin") && !isAdmin(session.user.id)) return fallback;
  return next;
}
