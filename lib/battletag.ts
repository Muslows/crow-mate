export function fallbackBattleTag(name: string, userId: string): string {
  const base = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 12);
  const tag = base.length >= 3 ? base : `Player${userId.slice(-3)}`.slice(0, 12);
  const digits = userId.replace(/\D/g, "").slice(-4).padStart(4, "0");
  return `${tag}#${digits}`;
}
