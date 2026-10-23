import type { TiebreakContext } from './types';

/**
 * Returns array of opponent scores for a player.
 * For byes, virtual opponent rule applies: counts as player's own score.
 */
function getOpponentScores(ctx: TiebreakContext): number[] {
  const { playerId, games, scores } = ctx;
  const oppScores: number[] = [];

  for (const g of games) {
    if (g.whiteId !== playerId && g.blackId !== playerId) continue;

    if (g.result === 'bye' || g.blackId === null) {
      // Bye: virtual opponent = player's own score
      oppScores.push(scores.get(playerId) ?? 0);
      continue;
    }

    const oppId = g.whiteId === playerId ? g.blackId : g.whiteId;
    if (oppId) {
      oppScores.push(scores.get(oppId) ?? 0);
    }
  }

  return oppScores;
}

export function computeBuchholz(ctx: TiebreakContext): number {
  const oppScores = getOpponentScores(ctx);
  return oppScores.reduce((sum, score) => sum + score, 0);
}

export function computeBuchholzCut1(ctx: TiebreakContext): number {
  const oppScores = getOpponentScores(ctx);
  if (oppScores.length <= 1) return 0;

  // Cut the lowest score
  const minScore = Math.min(...oppScores);
  return oppScores.reduce((sum, score) => sum + score, 0) - minScore;
}

export function computeMedianBuchholz(ctx: TiebreakContext): number {
  const oppScores = getOpponentScores(ctx);
  if (oppScores.length <= 2) return 0;

  oppScores.sort((a, b) => a - b);
  // Cut lowest and highest
  return oppScores.slice(1, -1).reduce((sum, score) => sum + score, 0);
}
