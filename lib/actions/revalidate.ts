import { revalidatePath } from "next/cache";

export function revalidateTeamViews(teamId?: string, playerId?: string) {
  revalidatePath("/");
  revalidatePath("/manage");
  revalidatePath("/org");
  revalidatePath("/admin");
  revalidatePath("/players");
  revalidatePath("/profile/planning");
  if (playerId) revalidatePath(`/players/${playerId}`);
  if (!teamId) return;
  revalidatePath(`/teams/${teamId}`);
  revalidatePath(`/teams/${teamId}/planning`);
  revalidatePath(`/manage/teams/${teamId}/edit`);
  revalidatePath(`/manage/teams/${teamId}/planning`);
  revalidatePath(`/manage/teams/${teamId}/scrims`);
  revalidatePath(`/manage/teams/${teamId}/find`);
}
