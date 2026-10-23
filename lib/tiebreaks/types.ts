import type { PastGame, PlayerInfo } from '../formats/types';
import type { TournamentSettings } from '@/types/database';

export interface TiebreakContext {
  playerId: string;
  players: PlayerInfo[];
  games: PastGame[];
  scores: Map<string, number>;
  settings: TournamentSettings;
}

export type TiebreakCalculator = (ctx: TiebreakContext) => number;
