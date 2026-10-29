import type {
  FormatEngine,
  PairingBoard,
  PairingContext,
  PairingResult,
  PastGame,
  PlayerInfo,
  StandingRow,
  StandingsContext,
  ValidationResult,
} from '../types';
import type { TournamentSettings } from '@/types/database';
import { selectByePlayer } from './byes';
import { computeColorProfile, assignColors } from './colors';
import { solveSwissMatching, PlayerNode } from './matching';
import { computeStandingsEngine } from '../../tiebreaks/engine';

export class SwissEngine implements FormatEngine {
  id = 'swiss' as const;

  validateSettings(settings: TournamentSettings, playerCount: number, totalRounds: number): ValidationResult {
    if (playerCount < 2) {
      return { valid: false, error: 'Tournament must have at least 2 players' };
    }
    const maxRounds = playerCount % 2 === 0 ? playerCount - 1 : playerCount;
    if (totalRounds > maxRounds) {
      return {
        valid: false,
        error: `Rounds cannot exceed ${maxRounds} for ${playerCount} players under the no-repeat pairing rule`,
      };
    }
    return { valid: true };
  }

  suggestedRounds(playerCount: number): number {
    if (playerCount <= 2) return 1;
    return Math.ceil(Math.log2(playerCount));
  }

  generateRound(ctx: PairingContext): PairingResult {
    const { roundNumber, players, pastGames, settings } = ctx;
    const warnings: string[] = [];

    // Filter active players (excluding players withdrawn before this round)
    let activePlayers = players.filter(
      (p) =>
        p.status === 'active' &&
        (p.withdrawnAfterRound === null || p.withdrawnAfterRound === undefined || p.withdrawnAfterRound >= roundNumber)
    );

    // Apply check-in filter if requested
    if (ctx.onlyCheckedIn || settings.requireCheckIn) {
      const checkedInOnly = activePlayers.filter((p) => p.checkedIn === true);
      // If there are at least 2 checked-in players, use them
      if (checkedInOnly.length >= 2) {
        activePlayers = checkedInOnly;
      }
    }

    if (activePlayers.length < 2) {
      return {
        boards: [],
        warnings: ['At least 2 active players are required to generate pairings.'],
      };
    }

    // Step 1: Handle odd player count (Bye)
    let pool = [...activePlayers];
    let byePlayer: PlayerInfo | null = null;

    if (pool.length % 2 !== 0) {
      // Sort to find appropriate bye candidate
      const tempScores = computePlayerScores(pool, pastGames, settings);
      pool.sort((a, b) => {
        const sA = tempScores.get(a.id) ?? 0;
        const sB = tempScores.get(b.id) ?? 0;
        if (sB !== sA) return sB - sA;
        return (a.seed ?? 9999) - (b.seed ?? 9999);
      });

      byePlayer = selectByePlayer(pool, pastGames);
      if (byePlayer) {
        pool = pool.filter((p) => p.id !== byePlayer!.id);
      }
    }

    // Step 2: Round 1 logic
    if (roundNumber === 1) {
      const roundSettings = { ...settings };
      if (ctx.pairingMethod === 'swiss_seeded' || ctx.pairingMethod === 'seeded') {
        roundSettings.firstRound = 'seeded';
      } else if (ctx.pairingMethod === 'swiss_random' || ctx.pairingMethod === 'random') {
        roundSettings.firstRound = 'random';
      }
      return this.generateRound1(pool, byePlayer, roundSettings);
    }

    // Step 3: Round 2+ logic
    const scores = computePlayerScores(pool, pastGames, settings);
    const floatHistory = computeFloatHistory(pool, pastGames, scores);

    // Sort players by score DESC, seed ASC
    pool.sort((a, b) => {
      const sA = scores.get(a.id) ?? 0;
      const sB = scores.get(b.id) ?? 0;
      if (sB !== sA) return sB - sA;
      return (a.seed ?? 9999) - (b.seed ?? 9999);
    });

    // Create player nodes with color profiles
    const nodes: PlayerNode[] = pool.map((p, idx) => ({
      index: idx,
      player: p,
      score: scores.get(p.id) ?? 0,
      profile: computeColorProfile(p.id, pastGames),
      floatedDownLastRound: floatHistory.get(p.id) ?? false,
    }));

    // Solve matching with relaxation ladder (Level 0: strict, Level 1: relaxed colors)
    let solution = solveSwissMatching(nodes, pastGames, 0);
    if (!solution) {
      warnings.push('Relaxed color restrictions to find a valid pairing.');
      solution = solveSwissMatching(nodes, pastGames, 1);
    }

    if (!solution) {
      return {
        boards: [],
        warnings: [
          'Not enough unplayed opponents — maximum rounds reached or repeat pairing unavoidable. Organizer manual adjustment required.',
        ],
      };
    }

    // Assign colors and assemble boards
    const boards: PairingBoard[] = [];
    let boardNum = 1;

    for (const [nodeA, nodeB] of solution.pairs) {
      // Higher score / seed is nodeA
      const [highNode, lowNode] = nodeA.score >= nodeB.score ? [nodeA, nodeB] : [nodeB, nodeA];
      const colorResult = assignColors(highNode.profile, lowNode.profile);

      if (colorResult.conflict) {
        warnings.push(
          `Color conflict on board: ${highNode.player.name} vs ${lowNode.player.name} both preferred ${highNode.profile.preferredColor}.`
        );
      }

      boards.push({
        board: boardNum++,
        whiteId: colorResult.whiteId,
        blackId: colorResult.blackId,
      });
    }

    // Sort boards by max score of board DESC, sum score DESC
    boards.sort((b1, b2) => {
      const s1A = scores.get(b1.whiteId!) ?? 0;
      const s1B = scores.get(b1.blackId!) ?? 0;
      const s2A = scores.get(b2.whiteId!) ?? 0;
      const s2B = scores.get(b2.blackId!) ?? 0;

      const max1 = Math.max(s1A, s1B);
      const max2 = Math.max(s2A, s2B);
      if (max2 !== max1) return max2 - max1;

      const sum1 = s1A + s1B;
      const sum2 = s2A + s2B;
      return sum2 - sum1;
    });

    // Re-index boards after sorting
    boards.forEach((b, idx) => {
      b.board = idx + 1;
    });

    // Add bye board if odd
    if (byePlayer) {
      boards.push({
        board: boards.length + 1,
        whiteId: byePlayer.id,
        blackId: null,
        isBye: true,
      });
    }

    return {
      boards,
      warnings: warnings.length > 0 ? warnings : undefined,
      byePlayerId: byePlayer?.id,
    };
  }

  private generateRound1(
    pool: PlayerInfo[],
    byePlayer: PlayerInfo | null,
    settings: TournamentSettings
  ): PairingResult {
    const list = [...pool];

    if (settings.firstRound === 'random') {
      // Deterministic or pseudo-random shuffle
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    } else {
      // Seeded: split top half vs bottom half
      list.sort((a, b) => (a.seed ?? 9999) - (b.seed ?? 9999));
      const half = list.length / 2;
      const topHalf = list.slice(0, half);
      const bottomHalf = list.slice(half);

      const paired: PlayerInfo[] = [];
      for (let i = 0; i < half; i++) {
        paired.push(topHalf[i], bottomHalf[i]);
      }
      list.length = 0;
      list.push(...paired);
    }

    const boards: PairingBoard[] = [];
    let boardNum = 1;

    for (let i = 0; i < list.length; i += 2) {
      const p1 = list[i];
      const p2 = list[i + 1];
      // Alternate colors by board
      const isWhiteFirst = boardNum % 2 !== 0;

      boards.push({
        board: boardNum++,
        whiteId: isWhiteFirst ? p1.id : p2.id,
        blackId: isWhiteFirst ? p2.id : p1.id,
      });
    }

    if (byePlayer) {
      boards.push({
        board: boards.length + 1,
        whiteId: byePlayer.id,
        blackId: null,
        isBye: true,
      });
    }

    return {
      boards,
      byePlayerId: byePlayer?.id,
    };
  }

  computeStandings(ctx: StandingsContext): StandingRow[] {
    return computeStandingsEngine(ctx);
  }
}

export function computePlayerScores(
  players: PlayerInfo[],
  games: PastGame[],
  settings: TournamentSettings
): Map<string, number> {
  const scores = new Map<string, number>();
  for (const p of players) {
    scores.set(p.id, 0);
  }

  const winPts = settings.winPoints ?? 1;
  const drawPts = settings.drawPoints ?? 0.5;
  const byePts = settings.byePoints ?? 1;

  for (const g of games) {
    if (g.result === 'bye' || g.blackId === null) {
      if (g.whiteId) {
        scores.set(g.whiteId, (scores.get(g.whiteId) ?? 0) + byePts);
      }
      continue;
    }

    if (g.result === 'white_win' || g.result === 'black_forfeit_win') {
      if (g.whiteId) scores.set(g.whiteId, (scores.get(g.whiteId) ?? 0) + winPts);
    } else if (g.result === 'black_win' || g.result === 'white_forfeit_win') {
      if (g.blackId) scores.set(g.blackId, (scores.get(g.blackId) ?? 0) + winPts);
    } else if (g.result === 'draw') {
      if (g.whiteId) scores.set(g.whiteId, (scores.get(g.whiteId) ?? 0) + drawPts);
      if (g.blackId) scores.set(g.blackId, (scores.get(g.blackId) ?? 0) + drawPts);
    }
  }

  return scores;
}

function computeFloatHistory(
  players: PlayerInfo[],
  games: PastGame[],
  scores: Map<string, number>
): Map<string, boolean> {
  const floatMap = new Map<string, boolean>();
  for (const p of players) {
    floatMap.set(p.id, false);
  }

  // Find max round number
  const rounds = games.map((g) => g.roundNumber);
  const lastRound = rounds.length > 0 ? Math.max(...rounds) : 0;
  if (lastRound === 0) return floatMap;

  // Games in the last round
  const lastRoundGames = games.filter((g) => g.roundNumber === lastRound && g.blackId !== null);
  for (const g of lastRoundGames) {
    if (!g.whiteId || !g.blackId) continue;
    const sW = scores.get(g.whiteId) ?? 0;
    const sB = scores.get(g.blackId) ?? 0;
    if (sW > sB) {
      // White was higher score and floated down to Black
      floatMap.set(g.whiteId, true);
    } else if (sB > sW) {
      // Black was higher score and floated down to White
      floatMap.set(g.blackId, true);
    }
  }

  return floatMap;
}
