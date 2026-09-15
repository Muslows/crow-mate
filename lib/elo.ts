export function averageSr(players: { sr: number }[]): number | null {
  if (players.length === 0) return null;
  const total = players.reduce((sum, player) => sum + player.sr, 0);
  return Math.round(total / players.length);
}
