import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { supabasePublicConfig } from "@/lib/supabase/config";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export function requestPublicOrigin(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("x-forwarded-host");
  if (process.env.VERCEL === "1" && host) {
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

export function createSupabaseCallbackClient(request: NextRequest) {
  const pending: PendingCookie[] = [];
  const config = supabasePublicConfig();
  if (!config) {
    return { supabase: null, pending };
  }

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          pending.push(cookie);
          request.cookies.set(cookie.name, cookie.value);
        }
      },
    },
  });

  return { supabase, pending };
}

export function redirectWithAuthCookies(
  location: string,
  pending: PendingCookie[],
) {
  const response = NextResponse.redirect(location);
  for (const { name, value, options } of pending) {
    response.cookies.set(name, value, options);
  }
  return response;
}
