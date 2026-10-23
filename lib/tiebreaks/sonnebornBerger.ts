import type { TiebreakContext } from './types';

export function computeSonnebornBerger(ctx: TiebreakContext): number {
  const { playerId, games, scores } = ctx;
  let sb = 0;

  for (const g of games) {
    if (g.whiteId !== playerId && g.blackId !== playerId) continue;
    if (g.result === 'bye' || g.blackId === null) continue;

    const isWhite = g.whiteId === playerId;
    const oppId = isWhite ? g.blackId : g.whiteId;
    if (!oppId) continue;

    const oppScore = scores.get(oppId) ?? 0;

    const won =
      (isWhite && (g.result === 'white_win' || g.result === 'black_forfeit_win')) ||
      (!isWhite && (g.result === 'black_win' || g.result === 'white_forfeit_win'));

    const drawn = g.result === 'draw';

    if (won) {
      sb += oppScore;
    } else if (drawn) {
      sb += oppScore * 0.5;
    }
  }

  return sb;
}
