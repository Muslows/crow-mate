import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { isBattleTagTaken } from "@/lib/battletag-availability";

export async function GET(request: NextRequest) {
  try {
    const tag = request.nextUrl.searchParams.get("tag") ?? "";
    const session = await getSession();

    const taken = await isBattleTagTaken(tag, session?.user.id);
    return Response.json({ available: !taken });
  } catch (error) {
    console.error("battletag availability", error);
    return Response.json(
      { available: false, error: true },
      { status: 500 },
    );
  }
}
