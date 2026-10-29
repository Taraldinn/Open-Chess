'use server';

import { createClient } from '@/lib/supabase/server';
import { getFormatEngine, PairingContext, PastGame, PlayerInfo } from '@/lib/formats';
import type { GameResult, RoundStatus, TournamentStatus } from '@/types/database';
import { assertTournamentAdmin } from './authGuards';

export async function startTournamentAction(
  tournamentId: string,
  options?: { pairingMethod?: string; onlyCheckedIn?: boolean }
) {
  await assertTournamentAdmin(tournamentId);
  const supabase = (await createClient()) as any;

  // Fetch tournament
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (tErr || !tournament) throw new Error('Tournament not found');
  const t = tournament as any;

  // Fetch active players
  const { data: players, error: pErr } = await supabase
    .from('players')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('status', 'active')
    .order('seed', { ascending: true });

  if (pErr || !players || players.length < 2) {
    throw new Error('At least 2 active players are required to start the tournament.');
  }

  const checkedInIds = new Set<string>(t.settings?.checkedInPlayerIds || []);
  const playerInfos: PlayerInfo[] = (players as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    rating: p.rating,
    club: p.club,
    seed: p.seed,
    status: p.status,
    checkedIn: Boolean(p.checked_in || checkedInIds.has(p.id)),
  }));

  const method = options?.pairingMethod || t.settings?.roundPairingMethods?.['1'] || t.format;
  const engine = getFormatEngine(method);

  const pairingCtx: PairingContext = {
    tournamentId: t.id,
    roundNumber: 1,
    players: playerInfos,
    pastGames: [],
    settings: t.settings,
    pairingMethod: method,
    onlyCheckedIn: options?.onlyCheckedIn ?? t.settings?.requireCheckIn,
  };

  const pairingResult = engine.generateRound(pairingCtx);
  if (pairingResult.boards.length === 0) {
    throw new Error(pairingResult.warnings?.[0] || 'Could not generate pairings for Round 1.');
  }

  // 1. Insert Round 1
  const roundInsertData: Record<string, any> = {
    tournament_id: tournamentId,
    number: 1,
    status: 'draft',
    pairing_method: method,
  };

  const { data: round, error: rErr } = await supabase
    .from('rounds')
    .insert(roundInsertData as any)
    .select()
    .single();

  if (rErr || !round) throw new Error(rErr?.message || 'Failed to create Round 1');

  // 2. Insert Games
  const gamesToInsert = pairingResult.boards.map((b) => ({
    tournament_id: tournamentId,
    round_id: (round as any).id,
    board: b.board,
    white_id: b.whiteId,
    black_id: b.blackId,
    result: (b.isBye ? 'bye' : 'unplayed') as GameResult,
  }));

  const { error: gErr } = await supabase.from('games').insert(gamesToInsert as any);
  if (gErr) throw new Error(gErr.message);

  // 3. Update tournament status & settings with round pairing method
  const currentSettings = t.settings || {};
  const roundPairingMethods = { ...(currentSettings.roundPairingMethods || {}), '1': method };

  await supabase
    .from('tournaments')
    .update({
      status: 'running' as TournamentStatus,
      current_round: 1,
      settings: {
        ...currentSettings,
        roundPairingMethods,
      },
    } as any)
    .eq('id', tournamentId);

  return { success: true, roundNumber: 1, method };
}

export async function publishRoundAction(roundId: string) {
  const supabase = (await createClient()) as any;

  // Retrieve tournament_id for authorization
  const { data: round, error: fetchErr } = await supabase
    .from('rounds')
    .select('tournament_id')
    .eq('id', roundId)
    .single();

  if (fetchErr || !round) {
    throw new Error('Round not found');
  }

  await assertTournamentAdmin(round.tournament_id);

  const { error } = await supabase
    .from('rounds')
    .update({ status: 'published' as RoundStatus })
    .eq('id', roundId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function generateNextRoundAction(
  tournamentId: string,
  options?: { pairingMethod?: string }
) {
  await assertTournamentAdmin(tournamentId);
  const supabase = (await createClient()) as any;

  // Fetch tournament
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (tErr || !tournament) throw new Error('Tournament not found');
  const t = tournament as any;

  const nextRoundNumber = t.current_round + 1;
  if (nextRoundNumber > t.total_rounds) {
    // Finish tournament
    await supabase
      .from('tournaments')
      .update({ status: 'finished' as TournamentStatus } as any)
      .eq('id', tournamentId);
    return { success: true, finished: true };
  }

  // Fetch all past games
  const { data: rawGames, error: gErr } = await supabase
    .from('games')
    .select('*, rounds!inner(number)')
    .eq('tournament_id', tournamentId);

  if (gErr) throw new Error(gErr.message);

  // Check if current round has unplayed games
  const unplayedInCurrent = ((rawGames as any[]) || []).filter(
    (g: any) => g.rounds.number === t.current_round && g.result === 'unplayed'
  );

  if (unplayedInCurrent.length > 0) {
    throw new Error(
      `Cannot generate Round ${nextRoundNumber}: all results in Round ${t.current_round} must be entered first.`
    );
  }

  // Mark previous round as completed
  await supabase
    .from('rounds')
    .update({ status: 'completed' as RoundStatus } as any)
    .eq('tournament_id', tournamentId)
    .eq('number', t.current_round);

  // Fetch active players
  const { data: players, error: pErr } = await supabase
    .from('players')
    .select('*')
    .eq('tournament_id', tournamentId);

  if (pErr || !players) throw new Error('Failed to load players');

  const checkedInIds = new Set<string>(t.settings?.checkedInPlayerIds || []);
  const playerInfos: PlayerInfo[] = (players as any[]).map((p: any) => ({
    id: p.id,
    name: p.name,
    rating: p.rating,
    club: p.club,
    seed: p.seed,
    status: p.status,
    checkedIn: Boolean(p.checked_in || checkedInIds.has(p.id)),
    withdrawnAfterRound: p.withdrawn_after_round,
  }));

  const pastGames: PastGame[] = ((rawGames as any[]) || []).map((g: any) => ({
    id: g.id,
    roundNumber: g.rounds.number,
    board: g.board,
    whiteId: g.whiteId || g.white_id,
    blackId: g.blackId || g.black_id,
    result: g.result as GameResult,
  }));

  // Determine round pairing method
  const method =
    options?.pairingMethod ||
    t.settings?.roundPairingMethods?.[String(nextRoundNumber)] ||
    t.format;

  const engine = getFormatEngine(method);
  const pairingCtx: PairingContext = {
    tournamentId: t.id,
    roundNumber: nextRoundNumber,
    players: playerInfos,
    pastGames,
    settings: t.settings,
    pairingMethod: method,
    onlyCheckedIn: t.settings?.requireCheckIn,
  };

  const pairingResult = engine.generateRound(pairingCtx);
  if (pairingResult.boards.length === 0) {
    throw new Error(
      pairingResult.warnings?.[0] || `Unable to generate pairings for Round ${nextRoundNumber}.`
    );
  }

  // Insert new round
  const roundInsertData: Record<string, any> = {
    tournament_id: tournamentId,
    number: nextRoundNumber,
    status: 'draft',
    pairing_method: method,
  };

  const { data: newRound, error: nrErr } = await supabase
    .from('rounds')
    .insert(roundInsertData as any)
    .select()
    .single();

  if (nrErr || !newRound) throw new Error(nrErr?.message || 'Failed to create new round');

  // Insert new games
  const gamesToInsert = pairingResult.boards.map((b) => ({
    tournament_id: tournamentId,
    round_id: (newRound as any).id,
    board: b.board,
    white_id: b.whiteId,
    black_id: b.blackId,
    result: (b.isBye ? 'bye' : 'unplayed') as GameResult,
  }));

  const { error: insErr } = await supabase.from('games').insert(gamesToInsert as any);
  if (insErr) throw new Error(insErr.message);

  // Update current round in tournament and persist roundPairingMethods
  const currentSettings = t.settings || {};
  const roundPairingMethods = {
    ...(currentSettings.roundPairingMethods || {}),
    [String(nextRoundNumber)]: method,
  };

  await supabase
    .from('tournaments')
    .update({
      current_round: nextRoundNumber,
      settings: {
        ...currentSettings,
        roundPairingMethods,
      },
    } as any)
    .eq('id', tournamentId);

  return {
    success: true,
    roundNumber: nextRoundNumber,
    pairingMethod: method,
    warnings: pairingResult.warnings,
  };
}

export async function undoDrawAction(tournamentId: string) {
  await assertTournamentAdmin(tournamentId);
  const supabase = (await createClient()) as any;

  // Fetch tournament
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (tErr || !tournament) throw new Error('Tournament not found');
  const t = tournament as any;

  if (t.current_round === 0) {
    throw new Error('No rounds have been drawn yet to undo.');
  }

  const targetRoundNum = t.current_round;

  // Fetch current round record
  const { data: targetRound, error: rErr } = await supabase
    .from('rounds')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('number', targetRoundNum)
    .single();

  if (targetRound) {
    // 1. Delete all games in current round
    await supabase.from('games').delete().eq('round_id', targetRound.id);
    // 2. Delete the round itself
    await supabase.from('rounds').delete().eq('id', targetRound.id);
  }

  // 3. If Round 1 was undone: revert tournament to 'draft', current_round = 0
  if (targetRoundNum === 1) {
    await supabase
      .from('tournaments')
      .update({
        status: 'draft' as TournamentStatus,
        current_round: 0,
      } as any)
      .eq('id', tournamentId);

    return { success: true, newCurrentRound: 0, status: 'draft' };
  }

  // If Round N (N > 1) was undone: set current_round = N - 1, and reopen previous round as 'published'
  const prevRoundNum = targetRoundNum - 1;
  await supabase
    .from('rounds')
    .update({ status: 'published' as RoundStatus } as any)
    .eq('tournament_id', tournamentId)
    .eq('number', prevRoundNum);

  await supabase
    .from('tournaments')
    .update({
      status: 'running' as TournamentStatus,
      current_round: prevRoundNum,
    } as any)
    .eq('id', tournamentId);

  return { success: true, newCurrentRound: prevRoundNum, status: 'running' };
}

export async function redoDrawAction(
  tournamentId: string,
  options?: { roundNumber?: number; pairingMethod?: string }
) {
  await assertTournamentAdmin(tournamentId);
  const supabase = (await createClient()) as any;

  // Fetch tournament
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (tErr || !tournament) throw new Error('Tournament not found');
  const t = tournament as any;

  const targetRoundNum = options?.roundNumber || t.current_round;
  if (targetRoundNum < 1) {
    throw new Error('Tournament has not started. Please generate Round 1 first.');
  }

  // Fetch the target round
  const { data: round, error: rErr } = await supabase
    .from('rounds')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('number', targetRoundNum)
    .single();

  if (rErr || !round) {
    throw new Error(`Round ${targetRoundNum} not found.`);
  }

  // Fetch all past games from rounds prior to targetRoundNum
  const { data: rawGames } = await supabase
    .from('games')
    .select('*, rounds!inner(number)')
    .eq('tournament_id', tournamentId)
    .lt('rounds.number', targetRoundNum);

  // Fetch active players
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('tournament_id', tournamentId);

  if (!players || players.length < 2) {
    throw new Error('At least 2 active players are required to generate pairings.');
  }

  const checkedInIds = new Set<string>(t.settings?.checkedInPlayerIds || []);
  const playerInfos: PlayerInfo[] = (players as any[]).map((p: any) => ({
    id: p.id,
    name: p.name,
    rating: p.rating,
    club: p.club,
    seed: p.seed,
    status: p.status,
    checkedIn: Boolean(p.checked_in || checkedInIds.has(p.id)),
    withdrawnAfterRound: p.withdrawn_after_round,
  }));

  const pastGames: PastGame[] = ((rawGames as any[]) || []).map((g: any) => ({
    id: g.id,
    roundNumber: g.rounds.number,
    board: g.board,
    whiteId: g.whiteId || g.white_id,
    blackId: g.blackId || g.black_id,
    result: g.result as GameResult,
  }));

  const method =
    options?.pairingMethod ||
    round.pairing_method ||
    t.settings?.roundPairingMethods?.[String(targetRoundNum)] ||
    t.format;

  const engine = getFormatEngine(method);
  const pairingCtx: PairingContext = {
    tournamentId: t.id,
    roundNumber: targetRoundNum,
    players: playerInfos,
    pastGames,
    settings: t.settings,
    pairingMethod: method,
    onlyCheckedIn: t.settings?.requireCheckIn,
  };

  const pairingResult = engine.generateRound(pairingCtx);
  if (pairingResult.boards.length === 0) {
    throw new Error(pairingResult.warnings?.[0] || 'Unable to generate pairings.');
  }

  // 1. Delete existing games in this round
  await supabase.from('games').delete().eq('round_id', round.id);

  // 2. Insert new games
  const gamesToInsert = pairingResult.boards.map((b) => ({
    tournament_id: tournamentId,
    round_id: round.id,
    board: b.board,
    white_id: b.whiteId,
    black_id: b.blackId,
    result: (b.isBye ? 'bye' : 'unplayed') as GameResult,
  }));

  const { error: insErr } = await supabase.from('games').insert(gamesToInsert as any);
  if (insErr) throw new Error(insErr.message);

  // 3. Update pairing_method on round and settings
  try {
    await supabase.from('rounds').update({ pairing_method: method }).eq('id', round.id);
  } catch (err: any) {
    console.warn('Could not update rounds.pairing_method:', err.message);
  }

  const currentSettings = t.settings || {};
  const roundPairingMethods = {
    ...(currentSettings.roundPairingMethods || {}),
    [String(targetRoundNum)]: method,
  };

  await supabase
    .from('tournaments')
    .update({
      settings: {
        ...currentSettings,
        roundPairingMethods,
      },
    } as any)
    .eq('id', tournamentId);

  return {
    success: true,
    roundNumber: targetRoundNum,
    pairingMethod: method,
    warnings: pairingResult.warnings,
  };
}

export async function setGameResultAction(gameId: string, result: GameResult) {
  const supabase = (await createClient()) as any;

  // Retrieve tournament_id for authorization
  const { data: game, error: fetchErr } = await supabase
    .from('games')
    .select('tournament_id')
    .eq('id', gameId)
    .single();

  if (fetchErr || !game) {
    throw new Error('Game not found');
  }

  await assertTournamentAdmin(game.tournament_id);

  const { error } = await supabase
    .from('games')
    .update({
      result,
      played_at: new Date().toISOString(),
    } as any)
    .eq('id', gameId);

  if (error) throw new Error(error.message);
  return { success: true };
}
