import type { TournamentFormat } from '@/types/database';
import type { FormatEngine } from './types';
import { SwissEngine } from './swiss';
import { RoundRobinEngine } from './roundRobin';
import { KnockoutEngine } from './knockout';

export function getFormatEngine(format: TournamentFormat): FormatEngine {
  switch (format) {
    case 'swiss':
    case 'team_swiss':
      return new SwissEngine();
    case 'round_robin':
      return new RoundRobinEngine(false);
    case 'double_round_robin':
      return new RoundRobinEngine(true);
    case 'knockout':
    case 'double_elimination':
      return new KnockoutEngine();
    default:
      return new SwissEngine();
  }
}

export * from './types';
export * from './swiss';
export * from './roundRobin';
export * from './knockout';
