import { describe, it, expect } from 'vitest';
import { RoundRobinEngine } from '@/lib/formats/roundRobin';
import type { PlayerInfo, TournamentSettings } from '@/lib/formats/types';

const defaultSettings: TournamentSettings = {
  winPoints: 1,
  drawPoints: 0.5,
  byePoints: 1,
  firstRound: 'seeded',
  tieBreaks: ['buchholz', 'sonneborn_berger'],
  allowLateEntry: false,
};

function createPlayers(count: number): PlayerInfo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
    seed: i + 1,
    status: 'active',
  }));
}

describe('RoundRobinEngine', () => {
  const engine = new RoundRobinEngine(false);

  it('suggests N-1 rounds for even N and N rounds for odd N', () => {
    expect(engine.suggestedRounds(4)).toBe(3);
    expect(engine.suggestedRounds(5)).toBe(5);
  });

  it('pairs every player against every other player exactly once with 4 players (3 rounds)', () => {
    const players = createPlayers(4);
    const playedPairs = new Set<string>();

    for (let round = 1; round <= 3; round++) {
      const pairing = engine.generateRound({
        tournamentId: 'rr-4',
        roundNumber: round,
        players,
        pastGames: [],
        settings: defaultSettings,
      });

      expect(pairing.boards.length).toBe(2);

      for (const b of pairing.boards) {
        expect(b.whiteId).not.toBeNull();
        expect(b.blackId).not.toBeNull();
        const pairKey =
          b.whiteId! < b.blackId!
            ? `${b.whiteId}-${b.blackId}`
            : `${b.blackId}-${b.whiteId}`;

        expect(playedPairs.has(pairKey)).toBe(false);
        playedPairs.add(pairKey);
      }
    }

    // With 4 players, total distinct pairs is 4*3/2 = 6
    expect(playedPairs.size).toBe(6);
  });

  it('gives each player exactly one bye in a 5-player round robin over 5 rounds', () => {
    const players = createPlayers(5);
    const byeCounts = new Map<string, number>();

    for (let round = 1; round <= 5; round++) {
      const pairing = engine.generateRound({
        tournamentId: 'rr-5',
        roundNumber: round,
        players,
        pastGames: [],
        settings: defaultSettings,
      });

      expect(pairing.boards.length).toBe(3); // 2 games + 1 bye
      const byeBoard = pairing.boards.find((b) => b.isBye);
      expect(byeBoard).toBeDefined();

      const pId = byeBoard!.whiteId!;
      byeCounts.set(pId, (byeCounts.get(pId) ?? 0) + 1);
    }

    expect(byeCounts.size).toBe(5);
    for (const [_, count] of byeCounts) {
      expect(count).toBe(1);
    }
  });
});
