"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAuthSession } from "@/lib/session";

export async function enablePlayerAccess() {
  const session = await requireAuthSession();
  await db.user.update({
    where: { id: session.user.id },
    data: { isPlayer: true },
  });
  await db.playerProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      sr: 0,
      primaryRole: "DPS",
      favoriteHeroes: [],
      experience: "",
    },
    update: {},
  });
  revalidatePath("/profile");
  revalidatePath("/manage");
  redirect("/profile");
}

export async function enableManagerAccess() {
  const session = await requireAuthSession();
  await db.user.update({
    where: { id: session.user.id },
    data: { isManager: true },
  });
  revalidatePath("/profile");
  revalidatePath("/manage");
  redirect("/manage");
}
