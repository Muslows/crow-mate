import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  canManageTeams,
  hasPlayerAccess,
  isPlayerRole,
} from "@/lib/roles";

export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export function sessionRole(session: AuthSession): string {
  return session.user.role ?? "MANAGER";
}

export function sessionCapabilities(session: AuthSession) {
  return {
    role: session.user.role,
    isManager: session.user.isManager,
    isPlayer: session.user.isPlayer,
  };
}

export { canManageTeams, hasPlayerAccess, isPlayerRole };

export async function requireAuthSession(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireManagerSession(): Promise<AuthSession> {
  const session = await requireAuthSession();
  if (!canManageTeams(sessionCapabilities(session))) {
    redirect("/manage");
  }
  return session;
}

export async function requirePlayerSession(): Promise<AuthSession> {
  const session = await requireAuthSession();
  if (!hasPlayerAccess(sessionCapabilities(session))) {
    redirect("/profile");
  }
  return session;
}
