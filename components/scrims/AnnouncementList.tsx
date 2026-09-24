"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { teamDisplayName } from "@/lib/team-name";
import { Panel } from "@/components/ui/Panel";
import { ChatLaunchButton } from "@/components/chat/ChatLaunchButton";
import { DeleteAnnouncementButton } from "@/components/scrims/DeleteAnnouncementButton";
import {
  openConversation,
  openLfsConversation,
  openOpenPositionConversation,
} from "@/lib/actions/chat";
import { discordContactLabel } from "@/lib/discord/announcements";
import { LFS_PLATFORMS, LFS_REGIONS, WEEKDAY_EN, WEEKDAY_FR } from "@/lib/lfs";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";
import type { Prisma } from "@prisma/client";

export type AnnouncementListItem = {
  id: string;
  type?: string;
  openPositionId?: string | null;
  content: string;
  description?: string | null;
  expiresAt: Date | string;
  snapshot?: Prisma.JsonValue | null;
  team?: {
    id?: string;
    name: string;
    estimatedSr: number;
    org: { tag: string | null; name: string } | null;
  } | null;
  createdBy: {
    id: string;
    name: string;
    discord: string;
    discordUsername: string;
  };
};

function snapshotString(
  snapshot: Prisma.JsonValue | null | undefined,
  key: string,
): string {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return "";
  }
  const value = (snapshot as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export function AnnouncementList({
  title,
  empty,
  items,
  currentUserId = null,
  filterable = false,
  moderateTeamId = null,
}: {
  title: string;
  empty: string;
  items: AnnouncementListItem[];
  currentUserId?: string | null;
  filterable?: boolean;
  moderateTeamId?: string | null;
}) {
  const [region, setRegion] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [weekday, setWeekday] = useState("all");

  const filtered = useMemo(() => {
    if (!filterable) return items;
    return items.filter((item) => {
      if (region !== "all" && snapshotString(item.snapshot, "region") !== region) {
        return false;
      }
      if (
        platform !== "all" &&
        snapshotString(item.snapshot, "platform") !== platform
      ) {
        return false;
      }
      if (
        weekday !== "all" &&
        snapshotString(item.snapshot, "weekday") !== weekday
      ) {
        return false;
      }
      return true;
    });
  }, [filterable, items, platform, region, weekday]);

  return (
    <Panel>
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
        {title}
      </h3>
      {filterable ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="form-label">
            Région
            <select
              className="hud-input"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              <option value="all">Toutes</option>
              {LFS_REGIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Plateforme
            <select
              className="hud-input"
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
            >
              <option value="all">Toutes</option>
              {LFS_PLATFORMS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Jour
            <select
              className="hud-input"
              value={weekday}
              onChange={(event) => setWeekday(event.target.value)}
            >
              <option value="all">Tous</option>
              {WEEKDAY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {WEEKDAY_FR[key]} ({WEEKDAY_EN[key]})
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      {filtered.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{empty}</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {filtered.map((item) => {
            const expiresAt = new Date(item.expiresAt);
            const weekdayKey = snapshotString(item.snapshot, "weekday");
            const weekdayLabel =
              weekdayKey && WEEKDAY_KEYS.includes(weekdayKey as WeekdayKey)
                ? WEEKDAY_EN[weekdayKey as WeekdayKey]
                : "";
            const contact =
              snapshotString(item.snapshot, "contactDiscord") ||
              discordContactLabel(item.createdBy);
            const own = currentUserId === item.createdBy.id;
            const canDelete =
              Boolean(currentUserId) &&
              (own ||
                Boolean(moderateTeamId && item.team?.id === moderateTeamId));
            const kind =
              item.type === "LFP" || item.type === "PLAYER"
                ? "LFP"
                : item.type === "LFT" || item.type === "TEAM"
                  ? "LFT"
                  : "LFS";
            const canContact = Boolean(currentUserId) && !own;
            const title =
              kind === "LFT"
                ? snapshotString(item.snapshot, "playerName") || item.createdBy.name
                : item.team
                  ? teamDisplayName(item.team.name, item.team.org?.tag)
                  : item.createdBy.name;
            const snapshotSr =
              item.snapshot &&
              typeof item.snapshot === "object" &&
              !Array.isArray(item.snapshot) &&
              typeof (item.snapshot as Record<string, unknown>).estimatedSr ===
                "number"
                ? ((item.snapshot as Record<string, unknown>).estimatedSr as number)
                : 0;
            const srLabel =
              item.team?.estimatedSr || snapshotSr
                ? `SR ${item.team?.estimatedSr || snapshotSr}`
                : "";
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-orange-400 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-900 dark:border-orange-500/70 dark:bg-orange-950/70 dark:text-orange-100">
                    {kind}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {title}
                  </span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {srLabel}
                    {weekdayLabel ? ` · ${weekdayLabel}` : ""}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap font-mono text-sm text-zinc-800 dark:text-zinc-100">
                  {item.content}
                </p>
                {item.description?.trim() ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                    {item.description}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    <p>
                      Contact Discord{" "}
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {contact}
                      </span>
                    </p>
                    <p>
                      Expire le{" "}
                      {expiresAt.toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                        timeZone: "Europe/Paris",
                      })}
                    </p>
                  </div>
                  {canContact && kind === "LFT" && currentUserId ? (
                    <ChatLaunchButton
                      action={openConversation}
                      hiddenFields={{ candidateUserId: item.createdBy.id }}
                      idleLabel="Contacter"
                      peerName={title}
                      currentUserId={currentUserId}
                      buttonClassName="hud-btn"
                      kicker="LFT"
                      emptyHint="Aucun message. Présente le roster et tes attentes ici."
                    />
                  ) : null}
                  {canContact && kind === "LFS" && currentUserId ? (
                    <ChatLaunchButton
                      action={openLfsConversation}
                      hiddenFields={{ announcementId: item.id }}
                      idleLabel="Contacter"
                      peerName={item.createdBy.name}
                      currentUserId={currentUserId}
                      buttonClassName="hud-btn"
                      kicker="LFS"
                      emptyHint="Aucun message. Négociez le créneau, le BO et le serveur ici."
                    />
                  ) : null}
                  {canContact && kind === "LFP" && currentUserId ? (
                    item.openPositionId ? (
                      <ChatLaunchButton
                        action={openOpenPositionConversation}
                        hiddenFields={{ positionId: item.openPositionId }}
                        idleLabel="Contacter"
                        peerName={item.createdBy.name}
                        currentUserId={currentUserId}
                        buttonClassName="hud-btn"
                        kicker="Recrutement"
                        emptyHint="Aucun message. Présente-toi et discute du poste ici."
                      />
                    ) : (
                      <ChatLaunchButton
                        action={openLfsConversation}
                        hiddenFields={{ announcementId: item.id }}
                        idleLabel="Contacter"
                        peerName={item.createdBy.name}
                        currentUserId={currentUserId}
                        buttonClassName="hud-btn"
                        kicker="Recrutement"
                        emptyHint="Aucun message. Présente-toi et discute du poste ici."
                      />
                    )
                  ) : null}
                  {canDelete ? (
                    <DeleteAnnouncementButton announcementId={item.id} />
                  ) : null}
                  {!currentUserId ? (
                    <Link href="/login" className="hud-btn">
                      Contacter
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
