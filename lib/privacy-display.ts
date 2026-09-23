export function publicDisplayName(input: {
  displayName?: string | null;
  name?: string | null;
}): string {
  const display = input.displayName?.trim();
  if (display) return display;
  const name = input.name?.trim();
  if (name) return name;
  return "Joueur";
}

export function ownerDisplayName(input: {
  displayName?: string | null;
  battleTag?: string | null;
  name?: string | null;
}): string {
  const display = input.displayName?.trim();
  if (display) return display;
  const tag = input.battleTag?.trim();
  if (tag) return tag;
  return publicDisplayName(input);
}

export function isBattleTagVisible(input: {
  battleTagPublic: boolean;
  viewerId?: string | null;
  ownerUserId: string;
}): boolean {
  if (input.battleTagPublic) return true;
  return Boolean(input.viewerId && input.viewerId === input.ownerUserId);
}
