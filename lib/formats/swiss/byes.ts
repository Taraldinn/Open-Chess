import type { PastGame, PlayerInfo } from '../types';

export function getPlayerByes(playerId: string, pastGames: PastGame[]): number {
  return pastGames.filter(
    (g) => (g.whiteId === playerId || g.blackId === playerId) && (g.result === 'bye' || g.blackId === null)
  ).length;
}

/**
 * Selects the lowest-ranked active player who has NOT had a bye yet.
 * @param sortedPlayers Players sorted by score DESC, tiebreaks DESC, seed ASC
 * @param pastGames Previous tournament games
 */
export function selectByePlayer(
  sortedPlayers: PlayerInfo[],
  pastGames: PastGame[]
): PlayerInfo | null {
  if (sortedPlayers.length % 2 === 0) {
    return null;
  }

  // Iterate backwards (from lowest ranked to highest)
  for (let i = sortedPlayers.length - 1; i >= 0; i--) {
    const p = sortedPlayers[i];
    if (getPlayerByes(p.id, pastGames) === 0) {
      return p;
    }
  }

  // Fallback if all players have had a bye: player with fewest byes
  let minByes = Infinity;
  let candidate: PlayerInfo | null = null;
  for (let i = sortedPlayers.length - 1; i >= 0; i--) {
    const p = sortedPlayers[i];
    const byes = getPlayerByes(p.id, pastGames);
    if (byes < minByes) {
      minByes = byes;
      candidate = p;
    }
  }

  return candidate || sortedPlayers[sortedPlayers.length - 1];
}
