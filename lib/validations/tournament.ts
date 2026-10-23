import { z } from 'zod';

export const createTournamentSchema = z.object({
  name: z.string().min(2, 'Tournament name must be at least 2 characters'),
  description: z.string().optional(),
  format: z.enum([
    'swiss',
    'round_robin',
    'double_round_robin',
    'knockout',
    'double_elimination',
    'arena',
    'scheveningen',
    'team_swiss',
  ]),
  visibility: z.enum(['public', 'unlisted', 'private']).default('public'),
  totalRounds: z.number().int().min(1, 'At least 1 round is required'),
  timeControl: z.string().optional(),
  venue: z.string().optional(),
  startDate: z.string().optional(),
  settings: z.object({
    winPoints: z.number().default(1),
    drawPoints: z.number().default(0.5),
    byePoints: z.number().default(1),
    firstRound: z.enum(['random', 'seeded']).default('random'),
    tieBreaks: z
      .array(
        z.enum([
          'buchholz',
          'buchholz_cut1',
          'median_buchholz',
          'sonneborn_berger',
          'wins',
          'direct_encounter',
        ])
      )
      .default(['buchholz', 'sonneborn_berger', 'wins']),
    allowLateEntry: z.boolean().default(true),
  }),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
