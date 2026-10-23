import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { SwissEngine } from '@/lib/formats/swiss';
import type { GameResult, PastGame, PlayerInfo, TournamentSettings } from '@/lib/formats/types';

const defaultSettings: TournamentSettings = {
  winPoints: 1,
  drawPoints: 0.5,
  byePoints: 1,
  firstRound: 'random',
  tieBreaks: ['buchholz', 'sonneborn_berger', 'wins', 'direct_encounter'],
  allowLateEntry: true,
};

function createPlayers(count: number): PlayerInfo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
    rating: 1500 + i * 50,
    seed: i + 1,
    status: 'active',
  }));
}

describe('SwissEngine Pairings', () => {
  const engine = new SwissEngine();

  it('validates settings and enforces max rounds <= N-1 (even N)', () => {
    const res = engine.validateSettings(defaultSettings, 8, 8);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('cannot exceed 7');

    const validRes = engine.validateSettings(defaultSettings, 8, 4);
    expect(validRes.valid).toBe(true);
  });

  it('pairs 8 players in Round 1 with no repeats and valid board counts', () => {
    const players = createPlayers(8);
    const result = engine.generateRound({
      tournamentId: 't1',
      roundNumber: 1,
      players,
      pastGames: [],
      settings: defaultSettings,
    });

    expect(result.boards.length).toBe(4);
    const pairedPlayers = new Set<string>();
    for (const b of result.boards) {
      expect(b.whiteId).toBeTruthy();
      expect(b.blackId).toBeTruthy();
      expect(b.whiteId).not.toBe(b.blackId);
      pairedPlayers.add(b.whiteId!);
      pairedPlayers.add(b.blackId!);
    }
    expect(pairedPlayers.size).toBe(8);
  });

  it('gives exactly one bye per round when player count is odd (7 players), and nobody gets 2 byes over 3 rounds', () => {
    const players = createPlayers(7);
    const pastGames: PastGame[] = [];
    const byeRecipients = new Set<string>();

    for (let round = 1; round <= 3; round++) {
      const pairing = engine.generateRound({
        tournamentId: 't1',
        roundNumber: round,
        players,
        pastGames,
        settings: defaultSettings,
      });

      expect(pairing.boards.length).toBe(4); // 3 games + 1 bye
      const byeBoard = pairing.boards.find((b) => b.isBye);
      expect(byeBoard).toBeDefined();
      expect(byeBoard?.whiteId).toBeDefined();
      expect(byeBoard?.blackId).toBeNull();

      const byePlayerId = byeBoard!.whiteId!;
      expect(byeRecipients.has(byePlayerId)).toBe(false); // S3: No player gets 2 byes
      byeRecipients.add(byePlayerId);

      for (const b of pairing.boards) {
        if (b.isBye) {
          pastGames.push({
            id: `g-${round}-${b.board}`,
            roundNumber: round,
            board: b.board,
            whiteId: b.whiteId,
            blackId: null,
            result: 'bye',
          });
        } else {
          pastGames.push({
            id: `g-${round}-${b.board}`,
            roundNumber: round,
            board: b.board,
            whiteId: b.whiteId,
            blackId: b.blackId,
            result: 'white_win',
          });
        }
      }
    }

    expect(byeRecipients.size).toBe(3);
  });

  it('simulates 8 players across 4 rounds: strictly zero repeat pairings', () => {
    const players = createPlayers(8);
    const pastGames: PastGame[] = [];
    const playedPairs = new Set<string>();

    for (let round = 1; round <= 4; round++) {
      const pairing = engine.generateRound({
        tournamentId: 't1',
        roundNumber: round,
        players,
        pastGames,
        settings: defaultSettings,
      });

      expect(pairing.boards.length).toBe(4);

      for (const b of pairing.boards) {
        const pairKey =
          b.whiteId! < b.blackId!
            ? `${b.whiteId}-${b.blackId}`
            : `${b.blackId}-${b.whiteId}`;

        // S4: No repeat pairing
        expect(playedPairs.has(pairKey)).toBe(false);
        playedPairs.add(pairKey);

        const result: GameResult = b.board % 2 === 0 ? 'white_win' : 'draw';
        pastGames.push({
          id: `g-${round}-${b.board}`,
          roundNumber: round,
          board: b.board,
          whiteId: b.whiteId,
          blackId: b.blackId,
          result,
        });
      }
    }
  });

  it('groups same-score players in Round 2 (winners vs winners, losers vs losers)', () => {
    const players = createPlayers(4);
    const g1: PastGame = {
      id: 'g1',
      roundNumber: 1,
      board: 1,
      whiteId: 'player-1',
      blackId: 'player-2',
      result: 'white_win',
    };
    const g2: PastGame = {
      id: 'g2',
      roundNumber: 1,
      board: 2,
      whiteId: 'player-3',
      blackId: 'player-4',
      result: 'black_win',
    };

    const r2 = engine.generateRound({
      tournamentId: 't1',
      roundNumber: 2,
      players,
      pastGames: [g1, g2],
      settings: defaultSettings,
    });

    const board1 = r2.boards[0];
    const board2 = r2.boards[1];

    const b1Players = new Set([board1.whiteId, board1.blackId]);
    const b2Players = new Set([board2.whiteId, board2.blackId]);

    expect(b1Players.has('player-1')).toBe(true);
    expect(b1Players.has('player-4')).toBe(true);

    expect(b2Players.has('player-2')).toBe(true);
    expect(b2Players.has('player-3')).toBe(true);
  });

  it('never pairs a withdrawn player in subsequent rounds', () => {
    const players = createPlayers(6);
    players[5].status = 'withdrawn';
    players[5].withdrawnAfterRound = 1;

    const pastGames: PastGame[] = [
      { id: '1', roundNumber: 1, board: 1, whiteId: 'player-1', blackId: 'player-2', result: 'white_win' },
      { id: '2', roundNumber: 1, board: 2, whiteId: 'player-3', blackId: 'player-4', result: 'draw' },
      { id: '3', roundNumber: 1, board: 3, whiteId: 'player-5', blackId: 'player-6', result: 'white_win' },
    ];

    const r2 = engine.generateRound({
      tournamentId: 't1',
      roundNumber: 2,
      players,
      pastGames,
      settings: defaultSettings,
    });

    for (const b of r2.boards) {
      expect(b.whiteId).not.toBe('player-6');
      expect(b.blackId).not.toBe('player-6');
    }
  });

  it('Property-based testing (fast-check): simulates multi-round tournaments and verifies hard invariants', () => {
    const possibleResults: GameResult[] = ['white_win', 'black_win', 'draw'];

    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 14 }), // player counts
        (playerCount) => {
          const totalRounds = engine.suggestedRounds(playerCount);
          const players = createPlayers(playerCount);
          const pastGames: PastGame[] = [];
          const playedPairs = new Set<string>();
          const byeCounts = new Map<string, number>();

          for (let round = 1; round <= totalRounds; round++) {
            const pairing = engine.generateRound({
              tournamentId: 'fc-tournament',
              roundNumber: round,
              players,
              pastGames,
              settings: defaultSettings,
            });

            if (pairing.boards.length === 0) {
              // Deadlock reached (flagged to organizer as expected by PRD §6.2 Step 5)
              expect(pairing.warnings).toBeDefined();
              break;
            }

            // Hard Rule 1: Every active player paired
            const expectedBoards = Math.ceil(playerCount / 2);
            expect(pairing.boards.length).toBe(expectedBoards);

            for (const b of pairing.boards) {
              if (b.isBye) {
                // Hard Rule 2 & 3: Exactly one bye if odd, max one bye per player
                const pId = b.whiteId!;
                const count = (byeCounts.get(pId) ?? 0) + 1;
                expect(count).toBeLessThanOrEqual(1);
                byeCounts.set(pId, count);

                pastGames.push({
                  id: `g-${round}-${b.board}`,
                  roundNumber: round,
                  board: b.board,
                  whiteId: b.whiteId,
                  blackId: null,
                  result: 'bye',
                });
              } else {
                // Hard Rule 4: Zero repeat pairings
                const pairKey =
                  b.whiteId! < b.blackId!
                    ? `${b.whiteId}-${b.blackId}`
                    : `${b.blackId}-${b.whiteId}`;

                expect(playedPairs.has(pairKey)).toBe(false);
                playedPairs.add(pairKey);

                const resIdx = (round * 7 + b.board * 13) % possibleResults.length;
                pastGames.push({
                  id: `g-${round}-${b.board}`,
                  roundNumber: round,
                  board: b.board,
                  whiteId: b.whiteId,
                  blackId: b.blackId,
                  result: possibleResults[resIdx],
                });
              }
            }
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});
