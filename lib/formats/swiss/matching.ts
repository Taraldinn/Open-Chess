import blossom from 'edmonds-blossom';
import type { PastGame, PlayerInfo } from '../types';
import { computeColorProfile, assignColors, PlayerColorProfile } from './colors';

export interface PlayerNode {
  index: number;
  player: PlayerInfo;
  score: number;
  profile: PlayerColorProfile;
  floatedDownLastRound: boolean;
}

const BIG_WEIGHT = 10_000_000;

/**
 * Builds the graph and solves for minimum cost perfect matching using Edmonds' Blossom algorithm.
 */
export function solveSwissMatching(
  nodes: PlayerNode[],
  pastGames: PastGame[],
  relaxationLevel: number = 0
): { pairs: [PlayerNode, PlayerNode][]; conflictWarning?: string } | null {
  const n = nodes.length;
  if (n === 0) return { pairs: [] };
  if (n % 2 !== 0) {
    throw new Error('solveSwissMatching requires an even number of nodes');
  }

  // Set of played pairs (S4: hard constraint - never repeat)
  const playedPairs = new Set<string>();
  for (const g of pastGames) {
    if (g.whiteId && g.blackId && g.result !== 'double_forfeit') {
      const p1 = g.whiteId < g.blackId ? g.whiteId : g.blackId;
      const p2 = g.whiteId < g.blackId ? g.blackId : g.whiteId;
      playedPairs.add(`${p1}-${p2}`);
    }
  }

  const edges: [number, number, number][] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const u = nodes[i];
      const v = nodes[j];

      // S4: No repeat pairings
      const pairKey = u.player.id < v.player.id
        ? `${u.player.id}-${v.player.id}`
        : `${v.player.id}-${u.player.id}`;

      if (playedPairs.has(pairKey)) {
        continue;
      }

      // Check color incompatibility
      const bothAbsoluteSameColor =
        u.profile.preferenceStrength >= 100 &&
        v.profile.preferenceStrength >= 100 &&
        u.profile.preferredColor === v.profile.preferredColor;

      // In Level 0 (strict), forbid 3-in-a-row or diff > 2
      if (relaxationLevel === 0 && bothAbsoluteSameColor) {
        continue;
      }

      // Calculate edge cost (lower is better)
      const scoreGap = Math.abs(u.score - v.score);
      let cost = scoreGap * scoreGap * 1000;

      // Rank distance preference inside group
      const rankDiff = Math.abs(u.index - v.index);
      cost += rankDiff * 2;

      // Color penalty
      if (bothAbsoluteSameColor) {
        cost += 50000;
      } else if (
        u.profile.preferredColor &&
        v.profile.preferredColor &&
        u.profile.preferredColor === v.profile.preferredColor
      ) {
        cost += (u.profile.preferenceStrength + v.profile.preferenceStrength) * 10;
      }

      // Float penalty (prefer players who didn't float last round)
      if (scoreGap > 0) {
        if (u.floatedDownLastRound) cost += 3000;
        if (v.floatedDownLastRound) cost += 3000;
      }

      const weight = Math.max(1, BIG_WEIGHT - Math.floor(cost));
      edges.push([i, j, weight]);
    }
  }

  // Run Edmonds' blossom maximum-weight matching with maxcardinality=true
  let matching: number[];
  try {
    matching = blossom(edges, true);
  } catch {
    return null;
  }

  // Verify all nodes are matched
  const matched = new Set<number>();
  const pairs: [PlayerNode, PlayerNode][] = [];

  for (let i = 0; i < n; i++) {
    if (matched.has(i)) continue;
    const partner = matching[i];
    if (partner === -1 || partner === undefined) {
      // Not a perfect matching
      return null;
    }
    matched.add(i);
    matched.add(partner);
    pairs.push([nodes[i], nodes[partner]]);
  }

  return { pairs };
}
