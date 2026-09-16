import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listMessagesForConversation } from "@/lib/data/chat";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const url = new URL(request.url);
  const after = url.searchParams.get("after") ?? undefined;
  const messages = await listMessagesForConversation(id, session.user.id, after);
  if (!messages) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ messages });
}
