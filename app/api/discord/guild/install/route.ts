import { NextRequest, NextResponse } from "next/server";
import { discordBotInviteUrl, discordServerConfig } from "@/lib/discord/config";

export async function GET(request: NextRequest) {
  const inviteUrl = discordBotInviteUrl();
  if (!discordServerConfig() || !inviteUrl) {
    return NextResponse.redirect(
      new URL("/admin/discord?discord=unconfigured", request.url),
    );
  }
  return NextResponse.redirect(inviteUrl);
}
