import { describe, it, expect } from 'vitest';
import { computeStandingsEngine } from '@/lib/tiebreaks/engine';
import type { PastGame, PlayerInfo, TournamentSettings } from '@/lib/formats/types';

const testSettings: TournamentSettings = {
  winPoints: 1,
  drawPoints: 0.5,
  byePoints: 1,
  firstRound: 'seeded',
  tieBreaks: ['buchholz', 'sonneborn_berger', 'wins', 'direct_encounter'],
  allowLateEntry: false,
};

describe('Standings and Tiebreak Calculations', () => {
  it('correctly calculates score, Buchholz, and Sonneborn-Berger for a 4-player tournament', () => {
    const players: PlayerInfo[] = [
      { id: 'p1', name: 'Alice', seed: 1, status: 'active' },
      { id: 'p2', name: 'Bob', seed: 2, status: 'active' },
      { id: 'p3', name: 'Charlie', seed: 3, status: 'active' },
      { id: 'p4', name: 'David', seed: 4, status: 'active' },
    ];

    // Round 1:
    // Alice (W) beats Bob (B) -> Alice 1, Bob 0
    // Charlie (W) draws David (B) -> Charlie 0.5, David 0.5
    // Round 2:
    // Alice (B) beats Charlie (W) -> Alice 2, Charlie 0.5
    // Bob (W) beats David (B) -> Bob 1, David 0.5

    const games: PastGame[] = [
      { id: 'g1', roundNumber: 1, board: 1, whiteId: 'p1', blackId: 'p2', result: 'white_win' },
      { id: 'g2', roundNumber: 1, board: 2, whiteId: 'p3', blackId: 'p4', result: 'draw' },
      { id: 'g3', roundNumber: 2, board: 1, whiteId: 'p3', blackId: 'p1', result: 'black_win' },
      { id: 'g4', roundNumber: 2, board: 2, whiteId: 'p2', blackId: 'p4', result: 'white_win' },
    ];

    const standings = computeStandingsEngine({
      players,
      games,
      settings: testSettings,
    });

    expect(standings.length).toBe(4);

    // 1st: Alice (p1): 2 pts. Opponents: Bob (1 pt) + Charlie (0.5 pt) -> Buchholz = 1.5
    // Sonneborn-Berger: beat Bob (1.0) + beat Charlie (0.5) = 1.5
    const alice = standings.find((s) => s.playerId === 'p1')!;
    expect(alice.rank).toBe(1);
    expect(alice.score).toBe(2);
    expect(alice.wins).toBe(2);
    expect(alice.tiebreaks.buchholz).toBe(1.5);
    expect(alice.tiebreaks.sonneborn_berger).toBe(1.5);

    // 2nd: Bob (p2): 1 pt. Opponents: Alice (2 pts) + David (0.5 pt) -> Buchholz = 2.5
    // Sonneborn-Berger: lost to Alice (0), beat David (0.5) = 0.5
    const bob = standings.find((s) => s.playerId === 'p2')!;
    expect(bob.rank).toBe(2);
    expect(bob.score).toBe(1);
    expect(bob.wins).toBe(1);
    expect(bob.tiebreaks.buchholz).toBe(2.5);
    expect(bob.tiebreaks.sonneborn_berger).toBe(0.5);

    // 3rd & 4th: Charlie and David both have 0.5 pt
    // Charlie: Opponents: David (0.5) + Alice (2.0) -> Buchholz = 2.5
    // David: Opponents: Charlie (0.5) + Bob (1.0) -> Buchholz = 1.5
    // Charlie has higher Buchholz (2.5 > 1.5), so Charlie ranks above David!
    const charlie = standings.find((s) => s.playerId === 'p3')!;
    const david = standings.find((s) => s.playerId === 'p4')!;
    expect(charlie.score).toBe(0.5);
    expect(david.score).toBe(0.5);
    expect(charlie.tiebreaks.buchholz).toBe(2.5);
    expect(david.tiebreaks.buchholz).toBe(1.5);
    expect(charlie.rank).toBe(3);
    expect(david.rank).toBe(4);
  });
});
