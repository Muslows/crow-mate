import type { DiscordOAuthConfig } from "@/lib/discord/config";

const DISCORD_API = "https://discord.com/api/v10";
const CANNOT_DM_CODES = new Set([50007, 50278]);

export type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  discriminator?: string;
};

type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

export type DiscordEmbed = {
  title: string;
  description: string;
  color: number;
  timestamp?: string;
  author?: { name: string };
  footer?: { text: string };
  fields?: { name: string; value: string; inline?: boolean }[];
};

export type DiscordTextChannel = {
  id: string;
  name: string;
  type: number;
};

export type DiscordGuild = {
  id: string;
  name: string;
};

export class DiscordApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: number | null = null,
    public readonly retryAfterMs: number | null = null,
  ) {
    super(message);
  }

  get cannotDm(): boolean {
    return this.code !== null && CANNOT_DM_CODES.has(this.code);
  }

  get noMutualGuild(): boolean {
    return this.code === 50278;
  }
}

async function discordFetch<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${DISCORD_API}${path}`, {
    ...init,
    cache: "no-store",
  });
  if (!response.ok) {
    let detail = `Discord API ${response.status}`;
    let retryAfterMs: number | null = null;
    let code: number | null = null;
    try {
      const body = (await response.json()) as {
        message?: string;
        error?: string;
        error_description?: string;
        code?: number;
        retry_after?: number;
      };
      if (body.error_description) detail = body.error_description;
      else if (body.message) detail = body.message;
      else if (body.error) detail = body.error;
      if (typeof body.code === "number") code = body.code;
      if (typeof body.retry_after === "number") {
        retryAfterMs = Math.ceil(body.retry_after * 1000);
      }
    } catch {
      // Discord can return an empty body for some authorization failures.
    }
    throw new DiscordApiError(detail, response.status, code, retryAfterMs);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function discordAuthorizeUrl(
  config: DiscordOAuthConfig,
  state: string,
): string {
  const query = [
    `client_id=${encodeURIComponent(config.clientId)}`,
    `redirect_uri=${encodeURIComponent(config.redirectUri)}`,
    "response_type=code",
    "scope=identify",
    `state=${encodeURIComponent(state)}`,
  ].join("&");
  return `https://discord.com/oauth2/authorize?${query}`;
}

export const DISCORD_BOT_GUILD_PERMISSIONS =
  1024 + 2048 + 8192 + 16384 + 65536;

export function discordBotGuildAuthorizeUrl(
  config: DiscordOAuthConfig,
  state: string,
  redirectUri: string,
): string {
  const query = [
    `client_id=${encodeURIComponent(config.clientId)}`,
    `permissions=${DISCORD_BOT_GUILD_PERMISSIONS}`,
    "scope=bot%20applications.commands",
    "response_type=code",
    `redirect_uri=${encodeURIComponent(redirectUri)}`,
    `state=${encodeURIComponent(state)}`,
  ].join("&");
  return `https://discord.com/oauth2/authorize?${query}`;
}

export async function exchangeDiscordCode(
  config: DiscordOAuthConfig,
  code: string,
): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
  });
  return discordFetch<DiscordTokenResponse>("/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
}

export function getDiscordUser(
  accessToken: string,
): Promise<DiscordUser> {
  return discordFetch("/users/@me", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
}

function botHeaders(config: DiscordOAuthConfig) {
  return {
    authorization: `Bot ${config.botToken}`,
    "content-type": "application/json",
  };
}

export async function sendDiscordDirectMessage(
  config: DiscordOAuthConfig,
  recipientId: string,
  embed: DiscordEmbed,
): Promise<void> {
  const channel = await discordFetch<{ id: string }>("/users/@me/channels", {
    method: "POST",
    headers: botHeaders(config),
    body: JSON.stringify({ recipient_id: recipientId }),
  });
  await discordFetch(`/channels/${channel.id}/messages`, {
    method: "POST",
    headers: botHeaders(config),
    body: JSON.stringify({
      embeds: [embed],
      allowed_mentions: { parse: [] },
    }),
  });
}

export async function getBotGuild(
  config: DiscordOAuthConfig,
  guildId: string,
): Promise<DiscordGuild> {
  return discordFetch(`/guilds/${guildId}`, {
    headers: botHeaders(config),
  });
}

export async function listGuildTextChannels(
  config: DiscordOAuthConfig,
  guildId: string,
): Promise<DiscordTextChannel[]> {
  const channels = await discordFetch<DiscordTextChannel[]>(
    `/guilds/${guildId}/channels`,
    { headers: botHeaders(config) },
  );
  return channels
    .filter((channel) => channel.type === 0 || channel.type === 5)
    .sort((left, right) => left.name.localeCompare(right.name, "fr"));
}

export async function sendDiscordChannelMessage(
  config: DiscordOAuthConfig,
  channelId: string,
  embed: DiscordEmbed,
): Promise<string> {
  const message = await discordFetch<{ id: string }>(
    `/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: botHeaders(config),
      body: JSON.stringify({
        embeds: [embed],
        allowed_mentions: { parse: [] },
      }),
    },
  );
  return message.id;
}

export async function deleteDiscordChannelMessage(
  config: DiscordOAuthConfig,
  channelId: string,
  messageId: string,
): Promise<void> {
  await discordFetch(`/channels/${channelId}/messages/${messageId}`, {
    method: "DELETE",
    headers: botHeaders(config),
  });
}
