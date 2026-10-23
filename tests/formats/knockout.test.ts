import { describe, it, expect } from 'vitest';
import { KnockoutEngine } from '@/lib/formats/knockout';
import type { PastGame, PlayerInfo, TournamentSettings } from '@/lib/formats/types';

const defaultSettings: TournamentSettings = {
  winPoints: 1,
  drawPoints: 0.5,
  byePoints: 1,
  firstRound: 'seeded',
  tieBreaks: [],
  allowLateEntry: false,
};

function createPlayers(count: number): PlayerInfo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p-${i + 1}`,
    name: `Player ${i + 1}`,
    seed: i + 1,
    status: 'active',
  }));
}

describe('KnockoutEngine', () => {
  const engine = new KnockoutEngine();

  it('calculates suggested rounds correctly', () => {
    expect(engine.suggestedRounds(8)).toBe(3);
    expect(engine.suggestedRounds(6)).toBe(3);
    expect(engine.suggestedRounds(16)).toBe(4);
  });

  it('allocates byes to top seeds when player count is not a power of 2 (6 players -> 2 byes for seeds 1 & 2)', () => {
    const players = createPlayers(6);
    const r1 = engine.generateRound({
      tournamentId: 'ko-6',
      roundNumber: 1,
      players,
      pastGames: [],
      settings: defaultSettings,
    });

    // 6 players -> bracket size 8 -> 2 byes, 2 active matches (4 players)
    expect(r1.boards.length).toBe(4);

    const byeBoards = r1.boards.filter((b) => b.isBye);
    expect(byeBoards.length).toBe(2);
    expect(byeBoards[0].whiteId).toBe('p-1');
    expect(byeBoards[1].whiteId).toBe('p-2');
  });

  it('advances winners from Round 1 into Round 2', () => {
    const players = createPlayers(4);
    const r1Games: PastGame[] = [
      { id: 'g1', roundNumber: 1, board: 1, whiteId: 'p-1', blackId: 'p-4', result: 'white_win' },
      { id: 'g2', roundNumber: 1, board: 2, whiteId: 'p-2', blackId: 'p-3', result: 'black_win' },
    ];

    const r2 = engine.generateRound({
      tournamentId: 'ko-4',
      roundNumber: 2,
      players,
      pastGames: r1Games,
      settings: defaultSettings,
    });

    expect(r2.boards.length).toBe(1);
    expect(r2.boards[0].whiteId).toBe('p-1');
    expect(r2.boards[0].blackId).toBe('p-3');
  });
});
