'use server';

import { createClient } from '@/lib/supabase/server';
import { getFormatEngine, PairingContext, PastGame, PlayerInfo } from '@/lib/formats';
import type { GameResult, RoundStatus, TournamentStatus } from '@/types/database';

export async function startTournamentAction(tournamentId: string) {
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

  const engine = getFormatEngine(t.format);
  const playerInfos: PlayerInfo[] = (players as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    rating: p.rating,
    club: p.club,
    seed: p.seed,
    status: p.status,
  }));

  const pairingCtx: PairingContext = {
    tournamentId: t.id,
    roundNumber: 1,
    players: playerInfos,
    pastGames: [],
    settings: t.settings,
  };

  const pairingResult = engine.generateRound(pairingCtx);
  if (pairingResult.boards.length === 0) {
    throw new Error('Could not generate pairings for Round 1.');
  }

  // 1. Insert Round 1
  const { data: round, error: rErr } = await supabase
    .from('rounds')
    .insert({
      tournament_id: tournamentId,
      number: 1,
      status: 'draft',
    } as any)
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

  // 3. Update tournament status
  await supabase
    .from('tournaments')
    .update({
      status: 'running' as TournamentStatus,
      current_round: 1,
    } as any)
    .eq('id', tournamentId);

  return { success: true, roundNumber: 1 };
}

export async function publishRoundAction(roundId: string) {
  const supabase = (await createClient()) as any;
  const { error } = await supabase
    .from('rounds')
    .update({ status: 'published' as RoundStatus })
    .eq('id', roundId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function generateNextRoundAction(tournamentId: string) {
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

  const playerInfos: PlayerInfo[] = (players as any[]).map((p: any) => ({
    id: p.id,
    name: p.name,
    rating: p.rating,
    club: p.club,
    seed: p.seed,
    status: p.status,
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

  const engine = getFormatEngine(t.format);
  const pairingCtx: PairingContext = {
    tournamentId: t.id,
    roundNumber: nextRoundNumber,
    players: playerInfos,
    pastGames,
    settings: t.settings,
  };

  const pairingResult = engine.generateRound(pairingCtx);
  if (pairingResult.boards.length === 0) {
    throw new Error(
      pairingResult.warnings?.[0] || `Unable to generate pairings for Round ${nextRoundNumber}.`
    );
  }

  // Insert new round
  const { data: newRound, error: nrErr } = await supabase
    .from('rounds')
    .insert({
      tournament_id: tournamentId,
      number: nextRoundNumber,
      status: 'draft',
    } as any)
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

  // Update current round in tournament
  await supabase
    .from('tournaments')
    .update({ current_round: nextRoundNumber } as any)
    .eq('id', tournamentId);

  return {
    success: true,
    roundNumber: nextRoundNumber,
    warnings: pairingResult.warnings,
  };
}

export async function setGameResultAction(gameId: string, result: GameResult) {
  const supabase = (await createClient()) as any;
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
