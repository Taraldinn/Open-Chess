import { describe, it, expect } from 'vitest';
import { getFormatEngine, SwissEngine, RoundRobinEngine, KnockoutEngine } from '@/lib/formats';
import type { PlayerInfo, TournamentSettings } from '@/lib/formats/types';

const defaultSettings: TournamentSettings = {
  winPoints: 1,
  drawPoints: 0.5,
  byePoints: 1,
  firstRound: 'seeded',
  tieBreaks: ['buchholz', 'sonneborn_berger', 'wins', 'direct_encounter'],
  allowLateEntry: true,
};

function createPlayers(count: number): PlayerInfo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
    rating: 2000 - i * 100, // Seed 1 has 2000, Seed 8 has 1300
    seed: i + 1,
    status: 'active',
  }));
}

describe('Round-Wise Pairing Method Changing System', () => {
  it('correctly maps pairing methods to format engines', () => {
    expect(getFormatEngine('swiss')).toBeInstanceOf(SwissEngine);
    expect(getFormatEngine('swiss_dutch')).toBeInstanceOf(SwissEngine);
    expect(getFormatEngine('swiss_seeded')).toBeInstanceOf(SwissEngine);
    expect(getFormatEngine('swiss_random')).toBeInstanceOf(SwissEngine);
    expect(getFormatEngine('round_robin')).toBeInstanceOf(RoundRobinEngine);
    expect(getFormatEngine('double_round_robin')).toBeInstanceOf(RoundRobinEngine);
    expect(getFormatEngine('knockout')).toBeInstanceOf(KnockoutEngine);
  });

  it('generates seeded pairings in Round 1 when pairingMethod is swiss_seeded', () => {
    const engine = new SwissEngine();
    const players = createPlayers(8);

    const result = engine.generateRound({
      tournamentId: 't1',
      roundNumber: 1,
      players,
      pastGames: [],
      settings: { ...defaultSettings, firstRound: 'random' }, // base setting is random, but overridden by ctx.pairingMethod
      pairingMethod: 'swiss_seeded',
    });

    expect(result.boards.length).toBe(4);
    // In seeded round 1 with 8 players:
    // Top half: 1, 2, 3, 4. Bottom half: 5, 6, 7, 8.
    // Boards should pair (1, 5), (2, 6), (3, 7), (4, 8)
    const pairs = result.boards.map((b) => [b.whiteId, b.blackId].sort());
    expect(pairs).toContainEqual(['player-1', 'player-5'].sort());
    expect(pairs).toContainEqual(['player-2', 'player-6'].sort());
    expect(pairs).toContainEqual(['player-3', 'player-7'].sort());
    expect(pairs).toContainEqual(['player-4', 'player-8'].sort());
  });

  it('allows round-by-round engine switching using settings.roundPairingMethods', () => {
    const players = createPlayers(4);
    const settings: TournamentSettings = {
      ...defaultSettings,
      roundPairingMethods: {
        1: 'swiss_seeded',
        2: 'round_robin',
      },
    };

    // Round 1 via Swiss
    const engineR1 = getFormatEngine(settings.roundPairingMethods?.[1] || 'swiss');
    const r1Result = engineR1.generateRound({
      tournamentId: 't1',
      roundNumber: 1,
      players,
      pastGames: [],
      settings,
      pairingMethod: settings.roundPairingMethods?.[1],
    });
    expect(r1Result.boards.length).toBe(2);

    // Round 2 via Round Robin engine
    const engineR2 = getFormatEngine(settings.roundPairingMethods?.[2] || 'swiss');
    expect(engineR2).toBeInstanceOf(RoundRobinEngine);
    const r2Result = engineR2.generateRound({
      tournamentId: 't1',
      roundNumber: 2,
      players,
      pastGames: [],
      settings,
      pairingMethod: settings.roundPairingMethods?.[2],
    });
    expect(r2Result.boards.length).toBe(2);
  });
});
