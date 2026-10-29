import { notFound } from 'next/navigation';
import { getTournamentBySlugAction } from '@/lib/actions/tournaments';
import { computeStandingsEngine } from '@/lib/tiebreaks/engine';
import type { PublicRoundItem } from '@/components/chess/PublicPairings';
import { PublicPageClient } from './PublicPageClient';
import type { PastGame, PlayerInfo } from '@/lib/formats';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicTournamentPage({ params }: Props) {
  const { slug } = await params;
  const tournament = await getTournamentBySlugAction(slug);

  if (!tournament) {
    notFound();
  }

  const players: PlayerInfo[] = (tournament.players || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    rating: p.rating,
    club: p.club,
    seed: p.seed,
    status: p.status,
  }));

  const playerMap = new Map<string, any>();
  players.forEach((p) => playerMap.set(p.id, p));

  const allGames: PastGame[] = [];
  const publicRounds: PublicRoundItem[] = [];

  for (const r of (tournament.rounds || []).sort((a: any, b: any) => a.number - b.number)) {
    const roundGames = (r.games || []).sort((a: any, b: any) => a.board - b.board);

    for (const g of roundGames) {
      allGames.push({
        id: g.id,
        roundNumber: r.number,
        board: g.board,
        whiteId: g.white_id,
        blackId: g.black_id,
        result: g.result,
      });
    }

    publicRounds.push({
      number: r.number,
      status: r.status,
      games: roundGames.map((g: any) => ({
        id: g.id,
        board: g.board,
        whiteId: g.white_id,
        blackId: g.black_id,
        result: g.result,
        whiteName: playerMap.get(g.white_id)?.name || 'Unknown',
        whiteRating: playerMap.get(g.white_id)?.rating,
        blackName: g.black_id ? playerMap.get(g.black_id)?.name || 'Unknown' : null,
        blackRating: g.black_id ? playerMap.get(g.black_id)?.rating : null,
      })),
    });
  }

  const standings = computeStandingsEngine({
    players,
    games: allGames,
    settings: tournament.settings,
  });

  return (
    <PublicPageClient
      tournament={tournament}
      players={players}
      allGames={allGames}
      publicRounds={publicRounds}
      standings={standings}
    />
  );
}
