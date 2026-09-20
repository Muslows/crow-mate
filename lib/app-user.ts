import type { User as AuthUser } from "@supabase/supabase-js";
import { Prisma, type OpenFlag, type UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { requireEmailVerification } from "@/lib/email-verification";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  isManager: boolean;
  isPlayer: boolean;
  isCoach: boolean;
  isCaster: boolean;
  isStaff: boolean;
  openToCast: OpenFlag;
  openToCoach: OpenFlag;
  deactivatedAt: Date | null;
  anonymizeAfter: Date | null;
};

export function toAppUser(user: {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  isManager: boolean;
  isPlayer: boolean;
  isCoach: boolean;
  isCaster: boolean;
  isStaff: boolean;
  openToCast: OpenFlag;
  openToCoach: OpenFlag;
  deactivatedAt: Date | null;
  anonymizeAfter: Date | null;
}): AppUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: requireEmailVerification() ? user.emailVerified : true,
    image: user.image,
    role: user.role,
    isManager: user.isManager,
    isPlayer: user.isPlayer,
    isCoach: user.isCoach,
    isCaster: user.isCaster,
    isStaff: user.isStaff,
    openToCast: user.openToCast,
    openToCoach: user.openToCoach,
    deactivatedAt: user.deactivatedAt,
    anonymizeAfter: user.anonymizeAfter,
  };
}

function displayName(authUser: AuthUser): string {
  const meta = authUser.user_metadata ?? {};
  const fromMeta =
    (typeof meta.name === "string" && meta.name.trim()) ||
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    "";
  if (fromMeta) return fromMeta.slice(0, 80);
  const email = authUser.email ?? "";
  return email.split("@")[0] || "Joueur";
}

export async function syncAppUserFromAuth(
  authUser: AuthUser,
  options: { confirmPendingEmail?: boolean } = {},
): Promise<AppUser> {
  const email = authUser.email?.toLowerCase() ?? "";
  const authEmailVerified =
    !requireEmailVerification() || Boolean(authUser.email_confirmed_at);
  const name = displayName(authUser);
  const image =
    typeof authUser.user_metadata?.avatar_url === "string"
      ? authUser.user_metadata.avatar_url
      : null;
  const existing = await db.user.findUnique({
    where: { id: authUser.id },
    select: { email: true, pendingEmail: true },
  });
  const pendingEmail = existing?.pendingEmail?.toLowerCase() ?? null;
  const emailChangeConfirmed =
    Boolean(options.confirmPendingEmail) &&
    Boolean(pendingEmail) &&
    pendingEmail === email &&
    authEmailVerified;
  const nextPendingEmail = emailChangeConfirmed
    ? null
    : existing?.pendingEmail ?? null;
  const emailVerified = authEmailVerified && !nextPendingEmail;
  const syncedEmail = nextPendingEmail ? existing?.email ?? email : email;

  let user;
  try {
    user = await db.user.upsert({
      where: { id: authUser.id },
      create: {
        id: authUser.id,
        email: syncedEmail,
        name,
        image,
        emailVerified,
        role: "PLAYER",
        isManager: false,
        isPlayer: true,
        isCoach: false,
        isCaster: false,
        isStaff: false,
        openToCast: "CLOSED",
        openToCoach: "CLOSED",
      },
      update: {
        email: syncedEmail,
        emailVerified,
        pendingEmail: nextPendingEmail,
        ...(image ? { image } : {}),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error(
        "Cet email est déjà associé à un autre profil. Utilise un autre email ou fusionne les comptes en base.",
      );
    }
    throw error;
  }

  await db.playerProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      sr: 0,
      role: "TANK",
      favoriteHeroes: [],
      experience: "",
    },
    update: {},
  });

  return toAppUser(user);
}
