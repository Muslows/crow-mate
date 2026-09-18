import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { syncAppUserFromAuth, type AppUser } from "@/lib/app-user";
import {
  canManageTeams,
  canStartRecruitmentChat,
  hasCasterAccess,
  hasCoachAccess,
  hasPlayerAccess,
  hasStaffAccess,
  isAdminRole,
  isPlayerRole,
} from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthSession = {
  user: AppUser;
};

export async function getSession(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  try {
    const appUser = await syncAppUserFromAuth(user);
    return { user: appUser };
  } catch (error) {
    console.error("[auth] sync app user", error);
    return null;
  }
}

export function sessionRole(session: AuthSession): string {
  return session.user.role ?? "PLAYER";
}

export function sessionCapabilities(session: AuthSession) {
  return {
    role: session.user.role,
    isManager: session.user.isManager,
    isPlayer: session.user.isPlayer,
    isCoach: session.user.isCoach,
    isCaster: session.user.isCaster,
    isStaff: session.user.isStaff,
    openToCast: session.user.openToCast,
    openToCoach: session.user.openToCoach,
    isAdmin: isAdmin(session.user.id),
  };
}

export {
  canManageTeams,
  canStartRecruitmentChat,
  hasCasterAccess,
  hasCoachAccess,
  hasPlayerAccess,
  hasStaffAccess,
  isAdminRole,
  isPlayerRole,
};

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

export async function requireAdminSession(): Promise<AuthSession> {
  const session = await requireAuthSession();
  if (!isAdmin(session.user.id)) {
    redirect("/");
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
