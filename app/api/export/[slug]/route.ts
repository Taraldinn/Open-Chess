import { NextRequest, NextResponse } from 'next/server';
import { getTournamentBySlugAction } from '@/lib/actions/tournaments';
import { computeStandingsEngine } from '@/lib/tiebreaks/engine';
import type { PastGame, PlayerInfo } from '@/lib/formats';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const tournament = await getTournamentBySlugAction(slug);

  if (!tournament) {
    return new NextResponse('Tournament not found', { status: 404 });
  }

  const players: PlayerInfo[] = (tournament.players || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    rating: p.rating,
    club: p.club,
    seed: p.seed,
    status: p.status,
  }));

  const games: PastGame[] = [];
  for (const r of tournament.rounds || []) {
    for (const g of r.games || []) {
      games.push({
        id: g.id,
        roundNumber: r.number,
        board: g.board,
        whiteId: g.white_id,
        blackId: g.black_id,
        result: g.result,
      });
    }
  }

  const standings = computeStandingsEngine({
    players,
    games,
    settings: tournament.settings,
  });

  // Build CSV
  const header = ['Rank', 'Seed', 'Name', 'Rating', 'Club', 'Score', 'Played', 'Wins', 'Draws', 'Losses', 'Buchholz', 'Sonneborn_Berger'];
  const rows = standings.map((s) => {
    const seed = players.find((p) => p.id === s.playerId)?.seed ?? '';
    return [
      s.rank,
      seed,
      `"${s.playerName.replace(/"/g, '""')}"`,
      s.rating || '',
      `"${(s.club || '').replace(/"/g, '""')}"`,
      s.score,
      s.played,
      s.wins,
      s.draws,
      s.losses,
      s.tiebreaks.buchholz?.toFixed(1) ?? '0',
      s.tiebreaks.sonneborn_berger?.toFixed(2) ?? '0',
    ].join(',');
  });

  const csvContent = [header.join(','), ...rows].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${tournament.slug}-standings.csv"`,
    },
  });
}
