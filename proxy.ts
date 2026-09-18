import { NextRequest, NextResponse } from "next/server";
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

  if (isProtectedPath(pathname) && !user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (
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
