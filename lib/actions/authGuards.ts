import { createClient } from '@/lib/supabase/server';

export async function assertTournamentAdmin(tournamentId: string) {
  const supabase = (await createClient()) as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required.');
  }

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('id, owner_id, slug, name')
    .eq('id', tournamentId)
    .single();

  if (error || !tournament) {
    throw new Error('Tournament not found');
  }

  // Strict User Isolation Check
  const isOwner = tournament.owner_id === user.id;

  if (!isOwner) {
    // Check if user is an invited co-organizer / arbiter
    const { data: member } = await supabase
      .from('tournament_members')
      .select('role')
      .eq('tournament_id', tournamentId)
      .eq('user_id', user.id)
      .single();

    if (!member) {
      throw new Error('Forbidden: You do not have permission to manage this tournament.');
    }
  }

  return { authorized: true, user, tournament };
}

export async function verifyUserIsTournamentAdmin(slug: string): Promise<boolean> {
  const supabase = (await createClient()) as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id, owner_id')
    .eq('slug', slug)
    .single();

  if (!tournament) return false;

  if (tournament.owner_id === user.id) return true;

  const { data: member } = await supabase
    .from('tournament_members')
    .select('role')
    .eq('tournament_id', tournament.id)
    .eq('user_id', user.id)
    .single();

  return Boolean(member);
}
