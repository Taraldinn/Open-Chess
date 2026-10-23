import type {
  FormatEngine,
  PairingBoard,
  PairingContext,
  PairingResult,
  PlayerInfo,
  StandingRow,
  StandingsContext,
  ValidationResult,
} from '../types';
import type { TournamentFormat, TournamentSettings } from '@/types/database';

export class KnockoutEngine implements FormatEngine {
  id: TournamentFormat = 'knockout';

  validateSettings(settings: TournamentSettings, playerCount: number, totalRounds: number): ValidationResult {
    if (playerCount < 2) {
      return { valid: false, error: 'Tournament must have at least 2 players' };
    }
    const neededRounds = Math.ceil(Math.log2(playerCount));
    if (totalRounds !== neededRounds) {
      return {
        valid: false,
        error: `Single Elimination for ${playerCount} players requires exactly ${neededRounds} rounds`,
      };
    }
    return { valid: true };
  }

  suggestedRounds(playerCount: number): number {
    if (playerCount < 2) return 1;
    return Math.ceil(Math.log2(playerCount));
  }

  generateRound(ctx: PairingContext): PairingResult {
    const { roundNumber, players, pastGames } = ctx;
    const sortedPlayers = [...players]
      .filter((p) => p.status === 'active')
      .sort((a, b) => (a.seed ?? 9999) - (b.seed ?? 9999));

    const n = sortedPlayers.length;
    if (n < 2) {
      return { boards: [], warnings: ['At least 2 active players required.'] };
    }

    // Bracket capacity (next power of 2)
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(n)));
    const byeCount = bracketSize - n;

    if (roundNumber === 1) {
      // Top byeCount seeds receive a bye into Round 2
      const byeSeeds = sortedPlayers.slice(0, byeCount);
      const playingSeeds = sortedPlayers.slice(byeCount);

      const boards: PairingBoard[] = [];
      let boardNum = 1;

      // Pair playing seeds: standard 1 vs N-1 inversion
      const playingCount = playingSeeds.length;
      for (let i = 0; i < playingCount / 2; i++) {
        const p1 = playingSeeds[i];
        const p2 = playingSeeds[playingCount - 1 - i];

        boards.push({
          board: boardNum++,
          whiteId: p1.id,
          blackId: p2.id,
        });
      }

      // Add bye boards for top seeds
      for (const p of byeSeeds) {
        boards.push({
          board: boardNum++,
          whiteId: p.id,
          blackId: null,
          isBye: true,
        });
      }

      return { boards };
    }

    // Round 2+: Identify winners from roundNumber - 1
    const prevRoundGames = pastGames.filter((g) => g.roundNumber === roundNumber - 1);
    const advancedPlayerIds: string[] = [];

    for (const g of prevRoundGames) {
      if (g.result === 'bye' || g.blackId === null) {
        if (g.whiteId) advancedPlayerIds.push(g.whiteId);
      } else if (g.result === 'white_win' || g.result === 'black_forfeit_win') {
        if (g.whiteId) advancedPlayerIds.push(g.whiteId);
      } else if (g.result === 'black_win' || g.result === 'white_forfeit_win') {
        if (g.blackId) advancedPlayerIds.push(g.blackId);
      } else {
        // Draw in knockout requires sudden-death / armageddon. Fallback: higher seed advances
        if (g.whiteId) advancedPlayerIds.push(g.whiteId);
      }
    }

    const advancingPlayers = sortedPlayers.filter((p) => advancedPlayerIds.includes(p.id));

    const boards: PairingBoard[] = [];
    let boardNum = 1;

    for (let i = 0; i < advancingPlayers.length; i += 2) {
      if (i + 1 < advancingPlayers.length) {
        boards.push({
          board: boardNum++,
          whiteId: advancingPlayers[i].id,
          blackId: advancingPlayers[i + 1].id,
        });
      } else {
        // Odd advancee (bye)
        boards.push({
          board: boardNum++,
          whiteId: advancingPlayers[i].id,
          blackId: null,
          isBye: true,
        });
      }
    }

    return { boards };
  }

  computeStandings(ctx: StandingsContext): StandingRow[] {
    const { players, games } = ctx;
    // For Knockout, ranks are determined by final round reached and results
    const rows: StandingRow[] = players.map((p) => {
      let roundsPlayed = 0;
      let won = 0;
      for (const g of games) {
        if (g.whiteId !== p.id && g.blackId !== p.id) continue;
        roundsPlayed++;
        if (
          (g.whiteId === p.id && (g.result === 'white_win' || g.result === 'bye' || g.blackId === null)) ||
          (g.blackId === p.id && g.result === 'black_win')
        ) {
          won++;
        }
      }
      return {
        playerId: p.id,
        playerName: p.name,
        rank: 0,
        score: won,
        played: roundsPlayed,
        wins: won,
        draws: 0,
        losses: roundsPlayed - won,
        tiebreaks: {},
        colorHistory: [],
        rating: p.rating,
        club: p.club,
      };
    });

    rows.sort((a, b) => b.score - a.score);
    rows.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    return rows;
  }
}
