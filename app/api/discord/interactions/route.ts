import { NextRequest, NextResponse } from "next/server";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import { handleSlashCommand } from "@/lib/discord/bot/handlers";
import { discordPublicKey, discordServerConfig } from "@/lib/discord/config";

export const runtime = "nodejs";

type RawInteraction = {
  type: number;
  guild_id?: string;
  guild?: { id?: string; name?: string };
  member?: { permissions?: string };
  data?: {
    name?: string;
    options?: { name: string; type: number; value?: string }[];
    resolved?: {
      channels?: Record<
        string,
        { id: string; name?: string; type?: number }
      >;
    };
  };
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  const publicKey = discordPublicKey();
  if (!publicKey || !discordServerConfig()) {
    return json({ error: "Discord interactions not configured" }, 503);
  }

  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const raw = await request.text();
  if (!signature || !timestamp) {
    return json({ error: "Missing signature" }, 401);
  }

  let valid = false;
  try {
    valid = await verifyKey(raw, signature, timestamp, publicKey);
  } catch (error) {
    console.error("[discord] interaction verify", error);
    return json({ error: "Invalid signature" }, 401);
  }
  if (!valid) return json({ error: "Invalid signature" }, 401);

  let interaction: RawInteraction;
  try {
    interaction = JSON.parse(raw) as RawInteraction;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (interaction.type === InteractionType.PING) {
    return json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type !== InteractionType.APPLICATION_COMMAND) {
    return json({ type: InteractionResponseType.PONG });
  }

  const option = interaction.data?.options?.find((item) => item.name === "salon");
  const channelId = typeof option?.value === "string" ? option.value : "";
  const resolved = channelId
    ? interaction.data?.resolved?.channels?.[channelId]
    : undefined;

  try {
    const reply = await handleSlashCommand({
      commandName: interaction.data?.name ?? "",
      guildId: interaction.guild_id ?? interaction.guild?.id ?? null,
      guildName: interaction.guild?.name ?? "",
      memberPermissions: BigInt(interaction.member?.permissions ?? "0"),
      channel: resolved
        ? {
            id: resolved.id,
            name: resolved.name ?? "",
            type: resolved.type ?? 0,
          }
        : channelId
          ? { id: channelId, name: "", type: 0 }
          : null,
    });
    return json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: reply.content,
        embeds: reply.embeds,
        flags: reply.ephemeral ? 64 : 0,
      },
    });
  } catch (error) {
    console.error("[discord] http interaction", error);
    return json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "Erreur interne. Réessaie.",
        flags: 64,
      },
    });
  }
}
