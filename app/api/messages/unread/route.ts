import { NextResponse } from "next/server";
import { countUnreadMessages } from "@/lib/data/chat";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const count = await countUnreadMessages(session.user.id);
  return NextResponse.json({ count });
}
