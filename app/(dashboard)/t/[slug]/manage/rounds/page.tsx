import { Container } from '@mantine/core';
import { notFound, redirect } from 'next/navigation';
import { getTournamentBySlugAction } from '@/lib/actions/tournaments';
import { verifyUserIsTournamentAdmin } from '@/lib/actions/authGuards';
import { TournamentManageHeader } from '@/components/tournament/TournamentManageHeader';
import { RoundsManagementClient } from './RoundsManagementClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ManageRoundsPage({ params }: Props) {
  const { slug } = await params;
  const isAuthorized = await verifyUserIsTournamentAdmin(slug);
  if (!isAuthorized) {
    redirect(`/t/${slug}?error=unauthorized`);
  }

  const tournament = await getTournamentBySlugAction(slug);

  if (!tournament) {
    notFound();
  }

  // Map games with their corresponding white and black players
  const playerMap = new Map<string, any>();
  for (const p of tournament.players || []) {
    playerMap.set(p.id, p);
  }

  const roundsWithPlayers = (tournament.rounds || [])
    .sort((a: any, b: any) => a.number - b.number)
    .map((r: any) => ({
      id: r.id,
      number: r.number,
      status: r.status,
      games: (r.games || [])
        .sort((g1: any, g2: any) => g1.board - g2.board)
        .map((g: any) => ({
          id: g.id,
          board: g.board,
          whiteId: g.white_id,
          blackId: g.black_id,
          result: g.result,
          whitePlayer: g.white_id ? playerMap.get(g.white_id) : null,
          blackPlayer: g.black_id ? playerMap.get(g.black_id) : null,
        })),
    }));

  return (
    <Container size="lg" py="xl">
      <TournamentManageHeader
        name={tournament.name}
        slug={tournament.slug}
        format={tournament.format}
        status={tournament.status}
        currentRound={tournament.current_round}
        totalRounds={tournament.total_rounds}
      />

      <RoundsManagementClient
        tournament={tournament}
        initialRounds={roundsWithPlayers}
      />
    </Container>
  );
}
