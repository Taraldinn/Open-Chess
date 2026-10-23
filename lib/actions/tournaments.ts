'use server';

import { createClient } from '@/lib/supabase/server';
import type { TournamentFormat, TournamentVisibility, TournamentStatus } from '@/types/database';
import { createTournamentSchema, type CreateTournamentInput } from '@/lib/validations/tournament';

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 30);
  const rand = Math.random().toString(36).substring(2, 7);
  return `${base || 'tournament'}-${rand}`;
}

export async function createTournamentAction(input: CreateTournamentInput) {
  const validated = createTournamentSchema.parse(input);
  const supabase = (await createClient()) as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ownerId = user?.id || null;
  const slug = generateSlug(validated.name);

  const { data, error } = await supabase
    .from('tournaments')
    .insert({
      owner_id: ownerId,
      slug,
      name: validated.name,
      description: validated.description || null,
      format: validated.format as TournamentFormat,
      status: 'draft' as TournamentStatus,
      visibility: validated.visibility as TournamentVisibility,
      total_rounds: validated.totalRounds,
      current_round: 0,
      time_control: validated.timeControl || null,
      venue: validated.venue || null,
      start_date: validated.startDate || new Date().toISOString(),
      settings: validated.settings,
    } as any)
    .select('slug')
    .single();

  if (error) {
    console.error('Supabase create tournament error:', error.message);
    if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
      throw new Error(
        'Database tables not initialized yet! Please execute the SQL migration script in your Supabase SQL Editor.'
      );
    }
    throw new Error(error.message);
  }

  return { success: true, slug: data?.slug || slug };
}

export async function getTournamentsAction() {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching tournaments:', error.message);
    return [];
  }

  return (data || []) as any[];
}

export async function getTournamentBySlugAction(slug: string) {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from('tournaments')
    .select('*, players(*), rounds(*, games(*))')
    .eq('slug', slug)
    .single();

  if (error) {
    console.warn(`Error fetching tournament with slug ${slug}:`, error.message);
    return null;
  }

  return data as any;
}
