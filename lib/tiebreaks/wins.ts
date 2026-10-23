import type { TiebreakContext } from './types';

export function computeWins(ctx: TiebreakContext): number {
  const { playerId, games } = ctx;
  let wins = 0;

  for (const g of games) {
    if (g.whiteId !== playerId && g.blackId !== playerId) continue;
    if (g.result === 'bye' || g.blackId === null) continue;

    const isWhite = g.whiteId === playerId;
    const won =
      (isWhite && (g.result === 'white_win' || g.result === 'black_forfeit_win')) ||
      (!isWhite && (g.result === 'black_win' || g.result === 'white_forfeit_win'));

    if (won) wins++;
  }

  return wins;
}
