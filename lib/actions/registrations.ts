'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { assertTournamentAdmin } from './authGuards';

const submitRegistrationSchema = z.object({
  tournamentSlug: z.string().min(1),
  token: z.string().optional().nullable(),
  name: z.string().min(1, 'Name is required').max(100),
  rating: z.number().int().optional().nullable(),
  club: z.string().max(100).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable().or(z.literal('')),
  notes: z.string().max(300).optional().nullable().or(z.literal('')),
  checkInNow: z.boolean().optional(),
});

export async function submitRegistrationAction(input: z.infer<typeof submitRegistrationSchema>) {
  const validated = submitRegistrationSchema.parse(input);
  const supabase = (await createClient()) as any;

  // 1. Fetch tournament by slug
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('id, name, slug, status, settings')
    .eq('slug', validated.tournamentSlug)
    .single();

  if (tErr || !tournament) {
    throw new Error('Tournament not found');
  }

  const settings = (tournament.settings || {}) as any;

  // 2. Validate registration open
  if (settings.registrationOpen === false) {
    throw new Error('Registration for this tournament is currently closed.');
  }

  // 3. Validate private registration token
  const expectedToken = settings.registrationToken;
  if (expectedToken && (!validated.token || validated.token !== expectedToken)) {
    throw new Error('Invalid or missing private registration link. Please request the official invite link from the host.');
  }

  const registrationData = {
    tournament_id: tournament.id,
    name: validated.name.trim(),
    rating: validated.rating ?? null,
    club: validated.club?.trim() ?? null,
    email: validated.email?.trim() || null,
    phone: validated.phone?.trim() || null,
    notes: validated.notes?.trim() || null,
    status: 'pending' as const,
  };

  let createdId: string = '';

  // 4. Insert into database table
  try {
    const { data: inserted, error: insErr } = await supabase
      .from('tournament_registrations')
      .insert(registrationData)
      .select()
      .single();

    if (!insErr && inserted) {
      createdId = inserted.id;
    }
  } catch (err: any) {
    console.warn('tournament_registrations table insert notice:', err.message);
  }

  // 5. Also sync to tournament.settings.pendingRegistrations for resilience
  try {
    const fallbackId = createdId || `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const pendingList = (settings.pendingRegistrations || []).filter(
      (r: any) => r.id !== fallbackId
    );
    const newEntry = {
      ...registrationData,
      id: fallbackId,
      created_at: new Date().toISOString(),
    };
    pendingList.push(newEntry);

    await supabase
      .from('tournaments')
      .update({
        settings: {
          ...settings,
          pendingRegistrations: pendingList,
        },
      })
      .eq('id', tournament.id);

    if (!createdId) createdId = fallbackId;
  } catch (err: any) {
    console.warn('Could not update pendingRegistrations in settings:', err.message);
  }

  return {
    success: true,
    registrationId: createdId,
    message: 'Your registration has been submitted and is pending host approval.',
  };
}

export async function getTournamentRegistrationsAction(tournamentId: string) {
  await assertTournamentAdmin(tournamentId);
  const supabase = (await createClient()) as any;

  // Try fetching from table
  try {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err: any) {
    console.warn('tournament_registrations fetch notice:', err.message);
  }

  // Fallback to settings.pendingRegistrations
  const { data: t } = await supabase
    .from('tournaments')
    .select('settings')
    .eq('id', tournamentId)
    .single();

  return (t?.settings?.pendingRegistrations || []) as any[];
}

export async function acceptRegistrationAction(tournamentId: string, registrationId: string) {
  await assertTournamentAdmin(tournamentId);
  const supabase = (await createClient()) as any;

  // 1. Find registration details
  let reg: any = null;

  try {
    const { data } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();
    if (data) reg = data;
  } catch {
    // ignore
  }

  const { data: t } = await supabase
    .from('tournaments')
    .select('settings')
    .eq('id', tournamentId)
    .single();

  const settings = (t?.settings || {}) as any;
  if (!reg && settings.pendingRegistrations) {
    reg = settings.pendingRegistrations.find((r: any) => r.id === registrationId);
  }

  if (!reg) {
    throw new Error('Registration request not found');
  }

  // 2. Count existing players to determine next seed
  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId);

  const seed = (count ?? 0) + 1;

  // 3. Add to players table
  const { data: newPlayer, error: pErr } = await supabase
    .from('players')
    .insert({
      tournament_id: tournamentId,
      name: reg.name,
      rating: reg.rating,
      club: reg.club,
      seed,
      status: 'active',
      checked_in: false,
    })
    .select()
    .single();

  if (pErr) {
    console.error('Error adding approved player:', pErr.message);
    throw new Error(pErr.message);
  }

  // 4. Mark registration approved in table
  try {
    await supabase
      .from('tournament_registrations')
      .update({ status: 'approved' })
      .eq('id', registrationId);
  } catch {
    // ignore
  }

  // 5. Update settings.pendingRegistrations
  if (settings.pendingRegistrations) {
    const updated = settings.pendingRegistrations.map((r: any) =>
      r.id === registrationId ? { ...r, status: 'approved' } : r
    );
    await supabase
      .from('tournaments')
      .update({
        settings: {
          ...settings,
          pendingRegistrations: updated,
        },
      })
      .eq('id', tournamentId);
  }

  return { success: true, player: newPlayer };
}

export async function rejectRegistrationAction(tournamentId: string, registrationId: string) {
  await assertTournamentAdmin(tournamentId);
  const supabase = (await createClient()) as any;

  // 1. Update table status
  try {
    await supabase
      .from('tournament_registrations')
      .update({ status: 'rejected' })
      .eq('id', registrationId);
  } catch {
    // ignore
  }

  // 2. Update settings fallback
  const { data: t } = await supabase
    .from('tournaments')
    .select('settings')
    .eq('id', tournamentId)
    .single();

  const settings = (t?.settings || {}) as any;
  if (settings.pendingRegistrations) {
    const updated = settings.pendingRegistrations.map((r: any) =>
      r.id === registrationId ? { ...r, status: 'rejected' } : r
    );
    await supabase
      .from('tournaments')
      .update({
        settings: {
          ...settings,
          pendingRegistrations: updated,
        },
      })
      .eq('id', tournamentId);
  }

  return { success: true };
}

export async function acceptAllRegistrationsAction(tournamentId: string) {
  await assertTournamentAdmin(tournamentId);
  const supabase = (await createClient()) as any;

  // Fetch pending registrations
  const regs = await getTournamentRegistrationsAction(tournamentId);
  const pending = regs.filter((r: any) => r.status === 'pending');

  if (pending.length === 0) {
    return { success: true, count: 0 };
  }

  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId);

  let currentSeed = (count ?? 0) + 1;
  const newPlayerRows = pending.map((r: any) => ({
    tournament_id: tournamentId,
    name: r.name,
    rating: r.rating,
    club: r.club,
    seed: currentSeed++,
    status: 'active' as const,
    checked_in: false,
  }));

  const { error: insErr } = await supabase.from('players').insert(newPlayerRows);
  if (insErr) {
    throw new Error(insErr.message);
  }

  // Mark all pending as approved
  const pendingIds = pending.map((r: any) => r.id);
  try {
    await supabase
      .from('tournament_registrations')
      .update({ status: 'approved' })
      .in('id', pendingIds);
  } catch {
    // ignore
  }

  const { data: t } = await supabase
    .from('tournaments')
    .select('settings')
    .eq('id', tournamentId)
    .single();

  const settings = (t?.settings || {}) as any;
  if (settings.pendingRegistrations) {
    const updated = settings.pendingRegistrations.map((r: any) =>
      pendingIds.includes(r.id) ? { ...r, status: 'approved' } : r
    );
    await supabase
      .from('tournaments')
      .update({
        settings: {
          ...settings,
          pendingRegistrations: updated,
        },
      })
      .eq('id', tournamentId);
  }

  return { success: true, count: pending.length };
}

export async function updateRegistrationSettingsAction(
  tournamentId: string,
  newSettings: {
    registrationOpen?: boolean;
    registrationToken?: string;
    requireCheckIn?: boolean;
    allowSelfCheckIn?: boolean;
  }
) {
  await assertTournamentAdmin(tournamentId);
  const supabase = (await createClient()) as any;

  const { data: t, error: fetchErr } = await supabase
    .from('tournaments')
    .select('settings')
    .eq('id', tournamentId)
    .single();

  if (fetchErr || !t) {
    throw new Error('Tournament not found');
  }

  const currentSettings = (t.settings || {}) as any;
  const updatedSettings = {
    ...currentSettings,
    ...newSettings,
  };

  const { error } = await supabase
    .from('tournaments')
    .update({ settings: updatedSettings })
    .eq('id', tournamentId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, settings: updatedSettings };
}
