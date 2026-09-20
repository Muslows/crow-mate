import { getDb } from "@/lib/db";

const TEXT_CHANNEL = new Set([0, 5]);

export type DiscordAnnounceKind = "scrim" | "player" | "team" | "ringer";

export function isGuildTextChannel(type: number): boolean {
  return TEXT_CHANNEL.has(type);
}

async function ensureServerConfigTable() {
  const db = getDb();
  await db.$executeRaw`
    CREATE TABLE IF NOT EXISTS "DiscordServerConfig" (
      "guildId" TEXT NOT NULL,
      "scrimChannelId" TEXT NOT NULL DEFAULT '',
      "playerChannelId" TEXT NOT NULL DEFAULT '',
      "teamChannelId" TEXT NOT NULL DEFAULT '',
      "ringerChannelId" TEXT NOT NULL DEFAULT '',
      "guildName" TEXT NOT NULL DEFAULT '',
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DiscordServerConfig_pkey" PRIMARY KEY ("guildId")
    )
  `;
  await db.$executeRaw`
    ALTER TABLE "DiscordServerConfig"
      ADD COLUMN IF NOT EXISTS "playerChannelId" TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS "teamChannelId" TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS "ringerChannelId" TEXT NOT NULL DEFAULT ''
  `;
}

function isMissingRelation(error: unknown) {
  return (
    error instanceof Error &&
    (/relation .* does not exist/i.test(error.message) ||
      /column .* does not exist/i.test(error.message) ||
      ("code" in error &&
        ((error as { code?: string }).code === "P2021" ||
          (error as { code?: string }).code === "P2022")))
  );
}

async function upsertChannel(
  kind: DiscordAnnounceKind,
  input: { guildId: string; guildName: string; channelId: string },
) {
  const db = getDb();
  const guildName = input.guildName.slice(0, 100);
  const channelId = input.channelId;
  const guildId = input.guildId;
  if (kind === "player") {
    await db.$executeRaw`
      INSERT INTO "DiscordServerConfig" (
        "guildId", "scrimChannelId", "playerChannelId", "teamChannelId",
        "ringerChannelId", "guildName", "updatedAt", "createdAt"
      )
      VALUES (${guildId}, '', ${channelId}, '', '', ${guildName}, NOW(), NOW())
      ON CONFLICT ("guildId") DO UPDATE SET
        "playerChannelId" = EXCLUDED."playerChannelId",
        "guildName" = EXCLUDED."guildName",
        "updatedAt" = NOW()
    `;
    return;
  }
  if (kind === "team") {
    await db.$executeRaw`
      INSERT INTO "DiscordServerConfig" (
        "guildId", "scrimChannelId", "playerChannelId", "teamChannelId",
        "ringerChannelId", "guildName", "updatedAt", "createdAt"
      )
      VALUES (${guildId}, '', '', ${channelId}, '', ${guildName}, NOW(), NOW())
      ON CONFLICT ("guildId") DO UPDATE SET
        "teamChannelId" = EXCLUDED."teamChannelId",
        "guildName" = EXCLUDED."guildName",
        "updatedAt" = NOW()
    `;
    return;
  }
  if (kind === "ringer") {
    await db.$executeRaw`
      INSERT INTO "DiscordServerConfig" (
        "guildId", "scrimChannelId", "playerChannelId", "teamChannelId",
        "ringerChannelId", "guildName", "updatedAt", "createdAt"
      )
      VALUES (${guildId}, '', '', '', ${channelId}, ${guildName}, NOW(), NOW())
      ON CONFLICT ("guildId") DO UPDATE SET
        "ringerChannelId" = EXCLUDED."ringerChannelId",
        "guildName" = EXCLUDED."guildName",
        "updatedAt" = NOW()
    `;
    return;
  }
  await db.$executeRaw`
    INSERT INTO "DiscordServerConfig" (
      "guildId", "scrimChannelId", "playerChannelId", "teamChannelId",
      "ringerChannelId", "guildName", "updatedAt", "createdAt"
    )
    VALUES (${guildId}, ${channelId}, '', '', '', ${guildName}, NOW(), NOW())
    ON CONFLICT ("guildId") DO UPDATE SET
      "scrimChannelId" = EXCLUDED."scrimChannelId",
      "guildName" = EXCLUDED."guildName",
      "updatedAt" = NOW()
  `;
}

export async function persistGuildChannel(input: {
  guildId: string;
  guildName: string;
  channelId: string;
  kind: DiscordAnnounceKind;
}): Promise<void> {
  try {
    await upsertChannel(input.kind, input);
    return;
  } catch (error) {
    if (!isMissingRelation(error)) throw error;
  }
  await ensureServerConfigTable();
  await upsertChannel(input.kind, input);
}

export async function persistScrimChannel(input: {
  guildId: string;
  guildName: string;
  channelId: string;
}): Promise<void> {
  return persistGuildChannel({ ...input, kind: "scrim" });
}

export async function listConfiguredServers(kind: DiscordAnnounceKind = "scrim") {
  const db = getDb();
  type Row = {
    guildId: string;
    channelId: string;
  };
  let rows: Row[] = [];
  try {
    if (kind === "player") {
      rows = await db.$queryRaw<Row[]>`
        SELECT "guildId", "playerChannelId" AS "channelId"
        FROM "DiscordServerConfig"
        WHERE "playerChannelId" <> ''
      `;
    } else if (kind === "team") {
      rows = await db.$queryRaw<Row[]>`
        SELECT "guildId", "teamChannelId" AS "channelId"
        FROM "DiscordServerConfig"
        WHERE "teamChannelId" <> ''
      `;
    } else if (kind === "ringer") {
      rows = await db.$queryRaw<Row[]>`
        SELECT "guildId", "ringerChannelId" AS "channelId"
        FROM "DiscordServerConfig"
        WHERE "ringerChannelId" <> ''
      `;
    } else {
      rows = await db.$queryRaw<Row[]>`
        SELECT "guildId", "scrimChannelId" AS "channelId"
        FROM "DiscordServerConfig"
        WHERE "scrimChannelId" <> ''
      `;
    }
  } catch (error) {
    if (!isMissingRelation(error)) throw error;
    return [];
  }
  const seen = new Set<string>();
  return rows.flatMap((server) => {
    if (!/^\d{17,19}$/.test(server.channelId)) return [];
    if (seen.has(server.channelId)) return [];
    seen.add(server.channelId);
    return [{ guildId: server.guildId, channelId: server.channelId }];
  });
}
