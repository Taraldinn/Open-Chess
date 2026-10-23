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
import { computeStandingsEngine } from '../../tiebreaks/engine';

export class RoundRobinEngine implements FormatEngine {
  id: TournamentFormat = 'round_robin';
  isDouble: boolean = false;

  constructor(isDouble = false) {
    this.isDouble = isDouble;
    this.id = isDouble ? 'double_round_robin' : 'round_robin';
  }

  validateSettings(settings: TournamentSettings, playerCount: number, totalRounds: number): ValidationResult {
    if (playerCount < 2) {
      return { valid: false, error: 'Tournament must have at least 2 players' };
    }
    const singleRounds = playerCount % 2 === 0 ? playerCount - 1 : playerCount;
    const requiredRounds = this.isDouble ? singleRounds * 2 : singleRounds;

    if (totalRounds !== requiredRounds) {
      return {
        valid: false,
        error: `${this.isDouble ? 'Double' : 'Single'} Round Robin for ${playerCount} players requires exactly ${requiredRounds} rounds`,
      };
    }
    return { valid: true };
  }

  suggestedRounds(playerCount: number): number {
    const single = playerCount % 2 === 0 ? playerCount - 1 : playerCount;
    return this.isDouble ? single * 2 : single;
  }

  generateRound(ctx: PairingContext): PairingResult {
    const { roundNumber, players } = ctx;
    const activePlayers = [...players]
      .filter((p) => p.status === 'active')
      .sort((a, b) => (a.seed ?? 9999) - (b.seed ?? 9999));

    const n = activePlayers.length;
    if (n < 2) {
      return { boards: [], warnings: ['At least 2 active players required.'] };
    }

    // Berger tables circle method
    // If odd, add a dummy "ghost" player for the bye
    const isOdd = n % 2 !== 0;
    const list: (PlayerInfo | null)[] = [...activePlayers];
    if (isOdd) {
      list.push(null); // Ghost for bye
    }

    const totalParticipants = list.length;
    const singleRounds = totalParticipants - 1;

    // Determine cycle and cycleRound (0-indexed)
    const isSecondCycle = this.isDouble && roundNumber > singleRounds;
    const cycleRound = (roundNumber - 1) % singleRounds;

    // Circle method: list[0] is fixed, rotate others by cycleRound
    const rotating = list.slice(1);
    const rotated = [
      rotating[(rotating.length - (cycleRound % rotating.length)) % rotating.length],
      ...rotating.slice(0, rotating.length - (cycleRound % rotating.length)),
      ...rotating.slice(rotating.length - (cycleRound % rotating.length) + 1),
    ];
    // Standard circle method array:
    const circle: (PlayerInfo | null)[] = [list[0]];
    for (let i = 0; i < rotating.length; i++) {
      const idx = (i - cycleRound + rotating.length * 100) % rotating.length;
      circle.push(rotating[idx]);
    }

    const boards: PairingBoard[] = [];
    let boardNum = 1;
    let byePlayerId: string | null = null;
    const half = totalParticipants / 2;

    for (let i = 0; i < half; i++) {
      const p1 = circle[i];
      const p2 = circle[totalParticipants - 1 - i];

      if (!p1 || !p2) {
        // One is the dummy bye player
        const realPlayer = p1 || p2;
        if (realPlayer) {
          byePlayerId = realPlayer.id;
          boards.push({
            board: 0, // renumbered later
            whiteId: realPlayer.id,
            blackId: null,
            isBye: true,
          });
        }
        continue;
      }

      // Alternate colors: in round r, alternate who gets white
      let whitePlayer = (i + cycleRound) % 2 === 0 ? p1 : p2;
      let blackPlayer = whitePlayer.id === p1.id ? p2 : p1;

      // In second cycle of double round robin, reverse colors
      if (isSecondCycle) {
        [whitePlayer, blackPlayer] = [blackPlayer, whitePlayer];
      }

      boards.push({
        board: boardNum++,
        whiteId: whitePlayer.id,
        blackId: blackPlayer.id,
      });
    }

    // Sort regular boards first, bye board at the end
    const regularBoards = boards.filter((b) => !b.isBye);
    const byeBoards = boards.filter((b) => b.isBye);

    regularBoards.forEach((b, idx) => {
      b.board = idx + 1;
    });

    if (byeBoards.length > 0) {
      byeBoards[0].board = regularBoards.length + 1;
      regularBoards.push(byeBoards[0]);
    }

    return {
      boards: regularBoards,
      byePlayerId,
    };
  }

  computeStandings(ctx: StandingsContext): StandingRow[] {
    return computeStandingsEngine(ctx);
  }
}
