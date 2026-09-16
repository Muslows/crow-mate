"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { syncDanglingManagerRole } from "@/lib/manager-lifecycle";
import { getSession, requireAuthSession } from "@/lib/session";

export async function reconcileDanglingManagerRole() {
  const session = await getSession();
  if (!session) return { demoted: false as const };
  const pathname = (await headers()).get("x-pathname") ?? "";
  const preserveOnboarding = pathname === "/manage/teams/new";
  const result = await syncDanglingManagerRole(session.user.id, {
    preserveOnboarding,
  });
  if (result.demoted) {
    revalidatePath("/", "layout");
  }
  return result;
}

export async function abandonTeamCreation() {
  const session = await requireAuthSession();
  await syncDanglingManagerRole(session.user.id, { preserveOnboarding: false });
  revalidatePath("/", "layout");
  redirect("/profile");
}
