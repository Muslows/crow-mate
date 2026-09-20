import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { syncAppUserFromAuth } from "@/lib/app-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/login") || value.startsWith("/register")) return null;
  return value;
}

function nextForOtpType(type: EmailOtpType | null): string {
  if (type === "recovery") return "/auth/reset-password";
  if (type === "signup" || type === "email" || type === "email_change") {
    return "/auth/email-confirmed?next=/profile/settings";
  }
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
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const otpType =
    rawType && OTP_TYPES.has(rawType as EmailOtpType)
      ? (rawType as EmailOtpType)
      : null;
  const next =
    safeNext(searchParams.get("next")) ?? nextForOtpType(otpType);

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?error=supabase_config`);
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      console.error("[auth] callback code", error);
      return NextResponse.redirect(`${origin}/login?error=callback`);
    }
    try {
      await syncAppUserFromAuth(data.user, { confirmPendingEmail: true });
    } catch (syncError) {
      console.error("[auth] callback sync", syncError);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (tokenHash && otpType) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
    if (error || !data.user) {
      console.error("[auth] callback otp", error);
      return NextResponse.redirect(`${origin}/login?error=callback`);
    }
    try {
      await syncAppUserFromAuth(data.user, { confirmPendingEmail: true });
    } catch (syncError) {
      console.error("[auth] callback sync", syncError);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
