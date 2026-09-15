import { revalidatePath } from "next/cache";

export function revalidateTeamViews(teamId?: string, playerId?: string) {
  revalidatePath("/");
  revalidatePath("/manage");
  revalidatePath("/players");
  if (playerId) revalidatePath(`/players/${playerId}`);
  if (!teamId) return;
  revalidatePath(`/teams/${teamId}`);
  revalidatePath(`/manage/teams/${teamId}/edit`);
}
