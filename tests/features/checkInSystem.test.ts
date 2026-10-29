import { describe, it, expect } from 'vitest';
import { SwissEngine } from '@/lib/formats/swiss';
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
    rating: 1800 - i * 50,
    seed: i + 1,
    status: 'active',
    checkedIn: false,
  }));
}

describe('Check-In System in Swiss Pairings', () => {
  const engine = new SwissEngine();

  it('pairs only checked-in players when requireCheckIn or onlyCheckedIn is enabled', () => {
    const players = createPlayers(6);
    // Only player-1, player-2, player-3, and player-4 are checked in
    players[0].checkedIn = true;
    players[1].checkedIn = true;
    players[2].checkedIn = true;
    players[3].checkedIn = true;
    players[4].checkedIn = false;
    players[5].checkedIn = false;

    const result = engine.generateRound({
      tournamentId: 't1',
      roundNumber: 1,
      players,
      pastGames: [],
      settings: { ...defaultSettings, requireCheckIn: true },
      onlyCheckedIn: true,
    });

    // 4 checked-in players should produce 2 boards
    expect(result.boards.length).toBe(2);
    const pairedIds = new Set<string>();
    for (const b of result.boards) {
      pairedIds.add(b.whiteId!);
      pairedIds.add(b.blackId!);
    }
    expect(pairedIds.has('player-1')).toBe(true);
    expect(pairedIds.has('player-2')).toBe(true);
    expect(pairedIds.has('player-3')).toBe(true);
    expect(pairedIds.has('player-4')).toBe(true);
    expect(pairedIds.has('player-5')).toBe(false);
    expect(pairedIds.has('player-6')).toBe(false);
  });

  it('gracefully falls back to all active players if fewer than 2 players are checked in', () => {
    const players = createPlayers(4);
    // Only 1 player checked in
    players[0].checkedIn = true;

    const result = engine.generateRound({
      tournamentId: 't1',
      roundNumber: 1,
      players,
      pastGames: [],
      settings: { ...defaultSettings, requireCheckIn: true },
      onlyCheckedIn: true,
    });

    // Fallback pairs all 4 active players (2 boards)
    expect(result.boards.length).toBe(2);
  });
});
