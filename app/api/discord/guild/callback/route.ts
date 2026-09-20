import { NextRequest, NextResponse } from "next/server";
import { getBotGuild } from "@/lib/discord/api";
import { discordServerConfig } from "@/lib/discord/config";
import {
  DISCORD_OAUTH_COOKIE,
  discordOAuthCookieOptions,
} from "@/lib/discord/oauth-state";
import { discordSnowflakeSchema } from "@/lib/validations/discord";

function redirectResult(request: NextRequest, status: string) {
  const response = NextResponse.redirect(
    new URL(
      `/admin/discord?discord=${encodeURIComponent(status)}`,
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
  const guildIdResult = discordSnowflakeSchema.safeParse(
    request.nextUrl.searchParams.get("guild_id") ?? "",
  );
  if (!config || !guildIdResult.success) {
    return redirectResult(request, "missing_guild");
  }
  try {
    await getBotGuild(config, guildIdResult.data);
    return redirectResult(request, "linked");
  } catch (error) {
    console.error("[discord] guild install", error);
    return redirectResult(request, "bot_missing");
  }
}
