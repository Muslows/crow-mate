import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { cronAuthSecret } from "@/lib/discord/config";
import {
  expireDueAnnouncements,
  publishPendingAnnouncementPosts,
} from "@/lib/discord/announce-dispatch";
import { dispatchDiscordOutbox } from "@/lib/discord/outbox";
import { processAccountAnonymizations } from "@/lib/account/anonymize";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest): boolean {
  const secret = cronAuthSecret();
  const supplied = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!secret || !supplied) return false;
  const expectedBuffer = Buffer.from(secret);
  const suppliedBuffer = Buffer.from(supplied);
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}

async function dispatch(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [discord, accounts, published, expired] = await Promise.all([
    dispatchDiscordOutbox(25),
    processAccountAnonymizations(10),
    publishPendingAnnouncementPosts(25),
    expireDueAnnouncements(25),
  ]);
  return Response.json({ discord, accounts, published, expired });
}

export const GET = dispatch;
export const POST = dispatch;
