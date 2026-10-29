'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { assertTournamentAdmin } from './authGuards';

const addPlayerSchema = z.object({
  tournamentId: z.string().uuid(),
  name: z.string().min(1, 'Player name is required'),
  rating: z.number().int().optional().nullable(),
  club: z.string().optional().nullable(),
  seed: z.number().int().optional().nullable(),
});

export async function addPlayerAction(input: z.infer<typeof addPlayerSchema>) {
  const validated = addPlayerSchema.parse(input);
  await assertTournamentAdmin(validated.tournamentId);
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
  await assertTournamentAdmin(tournamentId);
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

  // Get current status and tournament_id
  const { data: player, error: fetchErr } = await supabase
    .from('players')
    .select('tournament_id, status')
    .eq('id', playerId)
    .single();

  if (fetchErr || !player) {
    throw new Error('Player not found');
  }

  // Strict ownership check
  await assertTournamentAdmin(player.tournament_id);

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

  // Get tournament_id first to verify permission
  const { data: player, error: fetchErr } = await supabase
    .from('players')
    .select('tournament_id')
    .eq('id', playerId)
    .single();

  if (fetchErr || !player) {
    throw new Error('Player not found');
  }

  // Strict ownership check
  await assertTournamentAdmin(player.tournament_id);

  const { error } = await supabase.from('players').delete().eq('id', playerId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function reorderPlayersAction(
  tournamentId: string,
  orderedPlayerIds: string[]
) {
  await assertTournamentAdmin(tournamentId);
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

const updatePlayerSchema = z.object({
  playerId: z.string().uuid(),
  name: z.string().min(1, 'Player name is required'),
  rating: z.number().int().optional().nullable(),
  club: z.string().optional().nullable(),
  seed: z.number().int().optional().nullable(),
});

export async function updatePlayerAction(input: z.infer<typeof updatePlayerSchema>) {
  const validated = updatePlayerSchema.parse(input);
  const supabase = (await createClient()) as any;

  const { data: player, error: fetchErr } = await supabase
    .from('players')
    .select('tournament_id')
    .eq('id', validated.playerId)
    .single();

  if (fetchErr || !player) {
    throw new Error('Player not found');
  }

  await assertTournamentAdmin(player.tournament_id);

  const updateData: Record<string, any> = {
    name: validated.name.trim(),
    rating: validated.rating ?? null,
    club: validated.club?.trim() ?? null,
  };
  if (typeof validated.seed === 'number') {
    updateData.seed = validated.seed;
  }

  const { data, error } = await supabase
    .from('players')
    .update(updateData)
    .eq('id', validated.playerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating player:', error.message);
    throw new Error(error.message);
  }

  return { success: true, player: data };
}

export async function togglePlayerCheckInAction(playerId: string, targetCheckedIn?: boolean) {
  const supabase = (await createClient()) as any;

  const { data: player, error: fetchErr } = await supabase
    .from('players')
    .select('id, tournament_id, checked_in')
    .eq('id', playerId)
    .single();

  if (fetchErr || !player) {
    throw new Error('Player not found');
  }

  await assertTournamentAdmin(player.tournament_id);

  const newCheckedIn =
    typeof targetCheckedIn === 'boolean' ? targetCheckedIn : !Boolean(player.checked_in);

  // 1. Update player row
  try {
    await supabase
      .from('players')
      .update({ checked_in: newCheckedIn })
      .eq('id', playerId);
  } catch (err: any) {
    console.warn('Could not update players.checked_in column directly:', err.message);
  }

  // 2. Also keep resilient sync in tournament.settings.checkedInPlayerIds
  try {
    const { data: t } = await supabase
      .from('tournaments')
      .select('settings')
      .eq('id', player.tournament_id)
      .single();

    if (t) {
      const settings = (t.settings || {}) as any;
      const checkedSet = new Set<string>(settings.checkedInPlayerIds || []);
      if (newCheckedIn) {
        checkedSet.add(playerId);
      } else {
        checkedSet.delete(playerId);
      }
      await supabase
        .from('tournaments')
        .update({
          settings: {
            ...settings,
            checkedInPlayerIds: Array.from(checkedSet),
          },
        })
        .eq('id', player.tournament_id);
    }
  } catch (err: any) {
    console.warn('Could not update tournament.settings.checkedInPlayerIds:', err.message);
  }

  return { success: true, checkedIn: newCheckedIn };
}

export async function checkInAllAction(tournamentId: string, checkedIn: boolean) {
  await assertTournamentAdmin(tournamentId);
  const supabase = (await createClient()) as any;

  // 1. Update all players for this tournament
  try {
    await supabase
      .from('players')
      .update({ checked_in: checkedIn })
      .eq('tournament_id', tournamentId);
  } catch (err: any) {
    console.warn('Could not batch update players.checked_in:', err.message);
  }

  // 2. Update tournament settings
  const { data: players } = await supabase
    .from('players')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('status', 'active');

  const { data: t } = await supabase
    .from('tournaments')
    .select('settings')
    .eq('id', tournamentId)
    .single();

  if (t) {
    const settings = (t.settings || {}) as any;
    const allIds = checkedIn && players ? players.map((p: any) => p.id) : [];
    await supabase
      .from('tournaments')
      .update({
        settings: {
          ...settings,
          checkedInPlayerIds: allIds,
        },
      })
      .eq('id', tournamentId);
  }

  return { success: true, checkedIn };
}
