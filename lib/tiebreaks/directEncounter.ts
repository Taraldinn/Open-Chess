import type { TiebreakContext } from './types';

export function computeDirectEncounter(ctx: TiebreakContext): number {
  const { playerId, games, settings } = ctx;
  let points = 0;

  const winPts = settings.winPoints ?? 1;
  const drawPts = settings.drawPoints ?? 0.5;

  for (const g of games) {
    if (g.whiteId !== playerId && g.blackId !== playerId) continue;
    if (g.result === 'bye' || g.blackId === null) continue;

    const isWhite = g.whiteId === playerId;
    const won =
      (isWhite && (g.result === 'white_win' || g.result === 'black_forfeit_win')) ||
      (!isWhite && (g.result === 'black_win' || g.result === 'white_forfeit_win'));

    const drawn = g.result === 'draw';

    if (won) points += winPts;
    else if (drawn) points += drawPts;
  }

  return points;
}
