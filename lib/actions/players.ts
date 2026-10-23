'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const addPlayerSchema = z.object({
  tournamentId: z.string().uuid(),
  name: z.string().min(1, 'Player name is required'),
  rating: z.number().int().optional().nullable(),
  club: z.string().optional().nullable(),
  seed: z.number().int().optional().nullable(),
});

export async function addPlayerAction(input: z.infer<typeof addPlayerSchema>) {
  const validated = addPlayerSchema.parse(input);
  const supabase = (await createClient()) as any;

  // If seed is not provided, set to current player count + 1
  let seed = validated.seed;
  if (!seed) {
    const { count } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', validated.tournamentId);
    seed = (count ?? 0) + 1;
  }

  const { data, error } = await supabase
    .from('players')
    .insert({
      tournament_id: validated.tournamentId,
      name: validated.name.trim(),
      rating: validated.rating || null,
      club: validated.club?.trim() || null,
      seed,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding player:', error.message);
    throw new Error(error.message);
  }

  return { success: true, player: data };
}

export async function bulkAddPlayersAction(
  tournamentId: string,
  playersList: { name: string; rating?: number | null; club?: string | null }[]
) {
  const supabase = (await createClient()) as any;

  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId);

  let currentSeed = (count ?? 0) + 1;

  const rows = playersList.map((p) => ({
    tournament_id: tournamentId,
    name: p.name.trim(),
    rating: p.rating || null,
    club: p.club?.trim() || null,
    seed: currentSeed++,
    status: 'active' as const,
  }));

  const { data, error } = await supabase.from('players').insert(rows).select();

  if (error) {
    console.error('Error bulk adding players:', error.message);
    throw new Error(error.message);
  }

  return { success: true, count: data?.length ?? 0 };
}

export async function togglePlayerWithdrawalAction(playerId: string, currentRound: number) {
  const supabase = (await createClient()) as any;

  // Get current status
  const { data: player, error: fetchErr } = await supabase
    .from('players')
    .select('status')
    .eq('id', playerId)
    .single();

  if (fetchErr || !player) {
    throw new Error('Player not found');
  }

  const newStatus = player.status === 'active' ? 'withdrawn' : 'active';
  const withdrawnAfter = newStatus === 'withdrawn' ? currentRound : null;

  const { error } = await supabase
    .from('players')
    .update({
      status: newStatus,
      withdrawn_after_round: withdrawnAfter,
    })
    .eq('id', playerId);

  if (error) throw new Error(error.message);

  return { success: true, newStatus };
}

export async function deletePlayerAction(playerId: string) {
  const supabase = (await createClient()) as any;
  const { error } = await supabase.from('players').delete().eq('id', playerId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function reorderPlayersAction(
  tournamentId: string,
  orderedPlayerIds: string[]
) {
  const supabase = (await createClient()) as any;

  // Update seeds in parallel or sequence
  const updates = orderedPlayerIds.map((id, index) =>
    supabase
      .from('players')
      .update({ seed: index + 1 })
      .eq('id', id)
  );

  await Promise.all(updates);
  return { success: true };
}
