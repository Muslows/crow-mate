import { NextRequest, NextResponse } from "next/server";
import { DEV_SESSION_COOKIE, parseDevSessionUserId } from "@/lib/dev-session";
import {
  isLocalAppRuntime,
  requireEmailVerification,
} from "@/lib/email-verification";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/manage", "/profile", "/admin", "/org", "/messages"];

function isProtectedPath(pathname: string): boolean {
  const isTeamPlanning = /^\/teams\/[^/]+\/planning\/?$/.test(pathname);
  return (
    isTeamPlanning ||
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

export async function proxy(request: NextRequest) {
  const { response, user } = await refreshSupabaseSession(request);
  const pathname = request.nextUrl.pathname;

  const localUserId =
    isLocalAppRuntime() && !user
      ? await parseDevSessionUserId(request.cookies.get(DEV_SESSION_COOKIE)?.value)
      : null;

  if (isProtectedPath(pathname) && !user && !localUserId) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (
    requireEmailVerification() &&
    isProtectedPath(pathname) &&
    user &&
    !user.email_confirmed_at
  ) {
    const verify = new URL("/auth/verify-email", request.url);
    verify.searchParams.set("next", pathname);
    return NextResponse.redirect(verify);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
