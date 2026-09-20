import { after } from "next/server";
import {
  expireDueAnnouncements,
  publishPendingAnnouncementPosts,
} from "@/lib/discord/announce-dispatch";
import { dispatchDiscordOutbox } from "@/lib/discord/outbox";

let inFlight: Promise<void> | null = null;

async function runDispatch(limit: number) {
  try {
    const [discord, published, expired] = await Promise.all([
      dispatchDiscordOutbox(limit),
      publishPendingAnnouncementPosts(limit),
      expireDueAnnouncements(limit),
    ]);
    if (
      discord.processed > 0 ||
      published.processed > 0 ||
      expired.expired > 0
    ) {
      console.info("[discord] dispatch", { discord, published, expired });
    }
  } catch (error) {
    console.error("[discord] dispatch", error);
  }
}

async function dispatchNow(limit: number) {
  if (inFlight) return inFlight;
  inFlight = runDispatch(limit).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export function scheduleDiscordDispatch() {
  if (process.env.VERCEL === "1") {
    try {
      after(() => dispatchNow(10));
    } catch (error) {
      console.warn("[discord] after() indisponible, envoi immédiat", error);
      void dispatchNow(10);
    }
    return;
  }
  void dispatchNow(10);
}

let localTimer: ReturnType<typeof setInterval> | null = null;

export function startLocalDiscordDispatcher() {
  if (localTimer || process.env.VERCEL === "1") return;
  localTimer = setInterval(() => {
    void dispatchNow(15);
  }, 10_000);
  void dispatchNow(15);
}
