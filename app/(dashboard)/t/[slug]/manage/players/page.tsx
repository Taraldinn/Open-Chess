import { Container } from '@mantine/core';
import { notFound, redirect } from 'next/navigation';
import { getTournamentBySlugAction } from '@/lib/actions/tournaments';
import { verifyUserIsTournamentAdmin } from '@/lib/actions/authGuards';
import { TournamentManageHeader } from '@/components/tournament/TournamentManageHeader';
import { PlayerManagementClient } from './PlayerManagementClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ManagePlayersPage({ params }: Props) {
  const { slug } = await params;
  const isAuthorized = await verifyUserIsTournamentAdmin(slug);
  if (!isAuthorized) {
    redirect(`/t/${slug}?error=unauthorized`);
  }

  const tournament = await getTournamentBySlugAction(slug);

  if (!tournament) {
    notFound();
  }

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

      <PlayerManagementClient
        tournament={tournament}
        initialPlayers={tournament.players || []}
      />
    </Container>
  );
}
