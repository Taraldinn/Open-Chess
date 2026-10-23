import type { PastGame } from '../types';

export interface PlayerColorProfile {
  playerId: string;
  history: ('W' | 'B')[];
  whites: number;
  blacks: number;
  diff: number; // whites - blacks
  consecutiveW: number;
  consecutiveB: number;
  preferredColor: 'W' | 'B' | null;
  preferenceStrength: number; // 0 = none, 1-10 = mild, 100 = absolute (2-in-a-row or diff = +/-2)
}

export function computeColorProfile(playerId: string, pastGames: PastGame[]): PlayerColorProfile {
  // Sort past games by roundNumber
  const playedGames = pastGames
    .filter(
      (g) =>
        (g.whiteId === playerId || g.blackId === playerId) &&
        g.result !== 'bye' &&
        g.blackId !== null
    )
    .sort((a, b) => a.roundNumber - b.roundNumber);

  const history: ('W' | 'B')[] = [];
  let whites = 0;
  let blacks = 0;

  for (const game of playedGames) {
    if (game.whiteId === playerId) {
      history.push('W');
      whites++;
    } else if (game.blackId === playerId) {
      history.push('B');
      blacks++;
    }
  }

  let consecutiveW = 0;
  let consecutiveB = 0;

  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i] === 'W') {
      if (consecutiveB > 0) break;
      consecutiveW++;
    } else {
      if (consecutiveW > 0) break;
      consecutiveB++;
    }
  }

  const diff = whites - blacks;
  let preferredColor: 'W' | 'B' | null = null;
  let preferenceStrength = 0;

  if (consecutiveW >= 2 || diff >= 2) {
    preferredColor = 'B';
    preferenceStrength = 100;
  } else if (consecutiveB >= 2 || diff <= -2) {
    preferredColor = 'W';
    preferenceStrength = 100;
  } else if (diff > 0) {
    preferredColor = 'B';
    preferenceStrength = 10 * diff;
  } else if (diff < 0) {
    preferredColor = 'W';
    preferenceStrength = -10 * diff;
  } else if (history.length > 0) {
    // Diff is 0, prefer alternating from last game
    const lastColor = history[history.length - 1];
    preferredColor = lastColor === 'W' ? 'B' : 'W';
    preferenceStrength = 2;
  }

  return {
    playerId,
    history,
    whites,
    blacks,
    diff,
    consecutiveW,
    consecutiveB,
    preferredColor,
    preferenceStrength,
  };
}

/**
 * Assigns colors to a pair of players [p1, p2] where p1 is higher or equal rank to p2.
 * Returns { whiteId, blackId, conflict }
 */
export function assignColors(
  p1: PlayerColorProfile,
  p2: PlayerColorProfile
): { whiteId: string; blackId: string; conflict: boolean } {
  // Case 1: Both have absolute preferences
  if (p1.preferenceStrength >= 100 && p2.preferenceStrength >= 100) {
    if (p1.preferredColor !== p2.preferredColor) {
      return {
        whiteId: p1.preferredColor === 'W' ? p1.playerId : p2.playerId,
        blackId: p1.preferredColor === 'B' ? p1.playerId : p2.playerId,
        conflict: false,
      };
    }
    // Conflict: both absolutely want the same color! Higher rank (p1) gets it, flag conflict.
    return {
      whiteId: p1.preferredColor === 'W' ? p1.playerId : p2.playerId,
      blackId: p1.preferredColor === 'W' ? p2.playerId : p1.playerId,
      conflict: true,
    };
  }

  // Case 2: One has a stronger preference than the other
  if (p1.preferenceStrength > p2.preferenceStrength) {
    const p1Color = p1.preferredColor || 'W';
    return {
      whiteId: p1Color === 'W' ? p1.playerId : p2.playerId,
      blackId: p1Color === 'B' ? p1.playerId : p2.playerId,
      conflict: false,
    };
  } else if (p2.preferenceStrength > p1.preferenceStrength) {
    const p2Color = p2.preferredColor || 'W';
    return {
      whiteId: p2Color === 'W' ? p2.playerId : p1.playerId,
      blackId: p2Color === 'B' ? p2.playerId : p1.playerId,
      conflict: false,
    };
  }

  // Case 3: Same preference strength
  if (p1.preferredColor && p2.preferredColor && p1.preferredColor !== p2.preferredColor) {
    return {
      whiteId: p1.preferredColor === 'W' ? p1.playerId : p2.playerId,
      blackId: p1.preferredColor === 'B' ? p1.playerId : p2.playerId,
      conflict: false,
    };
  }

  // Case 4: Tie or both want same non-absolute color -> p1 gets opposite of their last color
  const p1Last = p1.history[p1.history.length - 1];
  const p1Choice: 'W' | 'B' = p1Last === 'W' ? 'B' : 'W';

  return {
    whiteId: p1Choice === 'W' ? p1.playerId : p2.playerId,
    blackId: p1Choice === 'B' ? p1.playerId : p2.playerId,
    conflict: p1.preferredColor === p2.preferredColor && p1.preferredColor !== null,
  };
}
