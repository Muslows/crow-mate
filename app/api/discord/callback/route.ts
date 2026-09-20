import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  exchangeDiscordCode,
  getDiscordUser,
} from "@/lib/discord/api";
import { discordServerConfig } from "@/lib/discord/config";
import {
  DISCORD_OAUTH_COOKIE,
  discordOAuthCookieOptions,
  verifyDiscordOAuthState,
} from "@/lib/discord/oauth-state";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { discordSnowflakeSchema } from "@/lib/validations/discord";

function redirectResult(request: NextRequest, status: string) {
  const response = NextResponse.redirect(
    new URL(
      `/profile/settings/notifications?discord=${encodeURIComponent(status)}`,
      request.url,
    ),
  );
  response.cookies.set(
    DISCORD_OAUTH_COOKIE,
    "",
    discordOAuthCookieOptions(request.nextUrl.protocol === "https:", 0),
  );
  return response;
}

export async function GET(request: NextRequest) {
  const oauthError = request.nextUrl.searchParams.get("error");
  if (oauthError === "access_denied") {
    return redirectResult(request, "cancelled");
  }

  const config = discordServerConfig();
  const session = await getSession();
  const queryState = request.nextUrl.searchParams.get("state") ?? "";
  const cookieValue = request.cookies.get(DISCORD_OAUTH_COOKIE)?.value;
  const state = config
    ? verifyDiscordOAuthState(cookieValue, queryState, config.stateSecret)
    : null;
  const userId = session?.user.id ?? state?.userId ?? null;

  console.info("[discord] oauth callback", {
    hasConfig: Boolean(config),
    hasSession: Boolean(session),
    hasCookie: Boolean(cookieValue),
    hasState: Boolean(queryState),
    hasCode: Boolean(request.nextUrl.searchParams.get("code")),
    oauthError: oauthError ?? null,
    userMatch: Boolean(session && state && session.user.id === state.userId),
  });

  if (!config || !state || !userId || (session && session.user.id !== state.userId)) {
    return redirectResult(request, "invalid_state");
  }
  if (state.intent === "guild") {
    return redirectResult(request, "invalid_state");
  }
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return redirectResult(request, "cancelled");

  try {
    const token = await exchangeDiscordCode(config, code);
    const discordUser = await getDiscordUser(token.access_token);
    const discordId = discordSnowflakeSchema.parse(discordUser.id);
    const username =
      discordUser.global_name?.trim() || discordUser.username.trim();

    await db.user.update({
      where: { id: userId },
      data: {
        discordId,
        discordUsername: username.slice(0, 64),
        discordDmBlocked: false,
        discord: username.slice(0, 64),
        notifyDiscordMessages: true,
        notifyDiscordInvitations: true,
        notifyDiscordScrims: true,
        notifyDiscordCancellations: true,
      },
    });
    return redirectResult(request, "linked");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return redirectResult(request, "already_linked");
    }
    console.error("[discord] oauth callback", error);
    return redirectResult(request, "oauth_error");
  }
}
