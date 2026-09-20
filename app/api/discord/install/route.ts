import { NextRequest, NextResponse } from "next/server";
import { discordAuthorizeUrl } from "@/lib/discord/api";
import { discordServerConfig } from "@/lib/discord/config";
import {
  createDiscordOAuthState,
  DISCORD_OAUTH_COOKIE,
  discordOAuthCookieOptions,
} from "@/lib/discord/oauth-state";
import { getSession } from "@/lib/session";

function notificationsRedirect(request: NextRequest, status: string) {
  return NextResponse.redirect(
    new URL(
      `/profile/settings/notifications?discord=${encodeURIComponent(status)}`,
      request.url,
    ),
  );
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(
      new URL("/login?next=/profile/settings/notifications", request.url),
    );
  }
  const config = discordServerConfig();
  const rawClientId = (
    process.env.DISCORD_CLIENT_ID ??
    process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ??
    ""
  ).trim();
  console.info("[discord] oauth authorize env", {
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? "set" : "undefined",
    NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
      ? "set"
      : "undefined",
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET
      ? "set"
      : "undefined",
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ? "set" : "undefined",
    DISCORD_OAUTH_STATE_SECRET: process.env.DISCORD_OAUTH_STATE_SECRET
      ? "set"
      : "undefined",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "undefined",
    clientId:
      config?.clientId ??
      `${rawClientId.slice(0, 4)}…(len ${rawClientId.length})`,
    clientIdIsSnowflake: Boolean(config?.clientId),
    redirectUri: config?.redirectUri ?? null,
  });
  if (!config) {
    return notificationsRedirect(request, "unconfigured");
  }

  const { state, cookieValue } = createDiscordOAuthState({
    userId: session.user.id,
    secret: config.stateSecret,
  });
  const authorizeUrl = discordAuthorizeUrl(config, state);
  console.info("[discord] oauth authorize url", authorizeUrl);

  const response = new NextResponse(
    `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Association Discord</title>
  </head>
  <body>
    <p>Redirection vers Discord…</p>
    <script>location.replace(${JSON.stringify(authorizeUrl)});</script>
  </body>
</html>`,
    {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
  response.cookies.set(
    DISCORD_OAUTH_COOKIE,
    cookieValue,
    discordOAuthCookieOptions(request.nextUrl.protocol === "https:"),
  );
  return response;
}
