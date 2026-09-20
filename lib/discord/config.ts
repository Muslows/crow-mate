import { publicAppUrl } from "@/lib/supabase/config";
import { discordSnowflakeSchema } from "@/lib/validations/discord";

export type DiscordOAuthConfig = {
  clientId: string;
  clientSecret: string;
  botToken: string;
  stateSecret: string;
  redirectUri: string;
};

function envText(...names: string[]): string {
  for (const name of names) {
    const raw = process.env[name]?.trim() ?? "";
    if (!raw) continue;
    const quoted = raw.match(/^(['"])([\s\S]*?)\1/);
    if (quoted?.[2]) return quoted[2];
    const comment = raw.search(/\s+#/);
    const value = (comment === -1 ? raw : raw.slice(0, comment))
      .trim()
      .replace(/^["']|["']$/g, "");
    if (value) return value;
  }
  return "";
}

export function cronAuthSecret(): string | null {
  return (
    process.env.CRON_SECRET?.trim() ||
    process.env.DISCORD_CRON_SECRET?.trim() ||
    null
  );
}

export function discordCommunityInviteUrl(): string | null {
  const value = process.env.DISCORD_COMMUNITY_INVITE_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (
      url.hostname !== "discord.gg" &&
      url.hostname !== "discord.com" &&
      url.hostname !== "www.discord.com"
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function discordPublicKey(): string | null {
  const value = envText("DISCORD_PUBLIC_KEY");
  return value || null;
}

export function discordBotInviteUrl(): string | null {
  const config = discordServerConfig();
  if (!config) return null;
  const query = [
    `client_id=${encodeURIComponent(config.clientId)}`,
    `permissions=${1024 + 2048 + 8192 + 16384 + 65536}`,
    "scope=bot%20applications.commands",
  ].join("&");
  return `https://discord.com/oauth2/authorize?${query}`;
}

export function discordOAuthRedirectUri(): string {
  return `${publicAppUrl()}/api/discord/callback`;
}

export function discordGuildOAuthRedirectUri(): string {
  return `${publicAppUrl()}/api/discord/guild/callback`;
}

export function discordServerConfig(): DiscordOAuthConfig | null {
  const clientId = envText(
    "DISCORD_CLIENT_ID",
    "NEXT_PUBLIC_DISCORD_CLIENT_ID",
  );
  const clientSecret = envText("DISCORD_CLIENT_SECRET");
  const botToken = envText("DISCORD_BOT_TOKEN");
  const stateSecret = envText(
    "DISCORD_OAUTH_STATE_SECRET",
    "BETTER_AUTH_SECRET",
  );
  if (
    !discordSnowflakeSchema.safeParse(clientId).success ||
    !clientSecret ||
    !botToken ||
    !stateSecret
  ) {
    return null;
  }
  return {
    clientId,
    clientSecret,
    botToken,
    stateSecret,
    redirectUri: discordOAuthRedirectUri(),
  };
}
