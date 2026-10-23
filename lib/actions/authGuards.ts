import { createClient } from '@/lib/supabase/server';

export async function assertTournamentAdmin(tournamentId: string) {
  const supabase = (await createClient()) as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('owner_id')
    .eq('id', tournamentId)
    .single();

  if (error || !tournament) {
    throw new Error('Tournament not found');
  }

  // If tournament has an assigned owner, enforce auth
  if (tournament.owner_id) {
    if (!user) {
      throw new Error('Unauthorized: Please sign in to manage this tournament.');
    }

    if (user.id !== tournament.owner_id) {
      // Check co-arbiter table
      const { data: member } = await supabase
        .from('tournament_members')
        .select('role')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .single();

      if (!member) {
        throw new Error('Unauthorized: You do not have arbiter permissions for this tournament.');
      }
    }
  }

  return { authorized: true, user, tournament };
}
