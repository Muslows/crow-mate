import { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { syncAppUserFromAuth } from "@/lib/app-user";
import {
  createSupabaseCallbackClient,
  redirectWithAuthCookies,
  requestPublicOrigin,
} from "@/lib/supabase/callback";

function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/login") || value.startsWith("/register")) return null;
  return value;
}

function nextForOtpType(type: EmailOtpType | null, hasAuthPayload: boolean): string {
  if (type === "recovery") return "/auth/reset-password";
  if (type === "signup" || type === "email" || type === "email_change") {
    return "/profile/settings";
  }
  if (hasAuthPayload) return "/profile/settings";
  return "/";
}

const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = requestPublicOrigin(request);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash") ?? searchParams.get("token");
  const rawType = searchParams.get("type");
  const otpType =
    rawType && OTP_TYPES.has(rawType as EmailOtpType)
      ? (rawType as EmailOtpType)
      : code
        ? "signup"
        : null;
  const next =
    safeNext(searchParams.get("next")) ??
    nextForOtpType(otpType, Boolean(code || tokenHash));

  const { supabase, pending } = createSupabaseCallbackClient(request);
  if (!supabase) {
    return redirectWithAuthCookies(
      `${origin}/login?error=supabase_config`,
      pending,
    );
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      console.error("[auth] callback code", error);
      return redirectWithAuthCookies(`${origin}/login?error=callback`, pending);
    }
    try {
      await syncAppUserFromAuth(data.user, { confirmPendingEmail: true });
    } catch (syncError) {
      console.error("[auth] callback sync", syncError);
      return redirectWithAuthCookies(
        `${origin}/login?error=profile_sync`,
        pending,
      );
    }
    return redirectWithAuthCookies(`${origin}${next}`, pending);
  }

  if (tokenHash && otpType) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
    if (error || !data.user) {
      console.error("[auth] callback otp", error);
      return redirectWithAuthCookies(`${origin}/login?error=callback`, pending);
    }
    try {
      await syncAppUserFromAuth(data.user, { confirmPendingEmail: true });
    } catch (syncError) {
      console.error("[auth] callback sync", syncError);
      return redirectWithAuthCookies(
        `${origin}/login?error=profile_sync`,
        pending,
      );
    }
    return redirectWithAuthCookies(`${origin}${next}`, pending);
  }

  return redirectWithAuthCookies(`${origin}/login?error=missing_code`, pending);
}
