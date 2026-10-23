import type { GameResult, PlayerStatus, TournamentFormat, TournamentSettings } from '@/types/database';

export interface PlayerInfo {
  id: string;
  name: string;
  rating?: number | null;
  seed?: number | null;
  club?: string | null;
  status: PlayerStatus;
  withdrawnAfterRound?: number | null;
}

export interface PastGame {
  id: string;
  roundNumber: number;
  board: number;
  whiteId: string | null;
  blackId: string | null;
  result: GameResult;
}

export interface PairingBoard {
  board: number;
  whiteId: string | null;
  blackId: string | null;
  isBye?: boolean;
}

export interface PairingContext {
  tournamentId: string;
  roundNumber: number;
  players: PlayerInfo[];
  pastGames: PastGame[];
  settings: TournamentSettings;
}

export interface PairingResult {
  boards: PairingBoard[];
  warnings?: string[];
  byePlayerId?: string | null;
}

export interface StandingRow {
  playerId: string;
  playerName: string;
  rank: number;
  score: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  tiebreaks: Record<string, number>;
  colorHistory: ('W' | 'B')[];
  rating?: number | null;
  club?: string | null;
}

export interface StandingsContext {
  players: PlayerInfo[];
  games: PastGame[];
  settings: TournamentSettings;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export interface FormatEngine {
  id: TournamentFormat;
  validateSettings(settings: TournamentSettings, playerCount: number, totalRounds: number): ValidationResult;
  suggestedRounds(playerCount: number, settings: TournamentSettings): number;
  generateRound(ctx: PairingContext): PairingResult;
  computeStandings(ctx: StandingsContext): StandingRow[];
}
