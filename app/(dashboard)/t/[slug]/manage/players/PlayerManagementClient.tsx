'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { PlayerList, PlayerItem } from '@/components/players/PlayerList';
import { startTournamentAction } from '@/lib/actions/rounds';

interface Props {
  tournament: any;
  initialPlayers: PlayerItem[];
}

export function PlayerManagementClient({ tournament, initialPlayers }: Props) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartTournament = async () => {
    if (tournament.status !== 'draft') {
      router.push(`/t/${tournament.slug}/manage/rounds`);
      return;
    }

    setIsStarting(true);
    try {
      const res = await startTournamentAction(tournament.id);
      if (res.success) {
        notifications.show({
          title: 'Tournament Started!',
          message: 'Round 1 pairings generated successfully.',
          color: 'green',
        });
        router.push(`/t/${tournament.slug}/manage/rounds`);
      }
    } catch (err: any) {
      notifications.show({
        title: 'Could Not Start Tournament',
        message: err.message,
        color: 'red',
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <PlayerList
      tournamentId={tournament.id}
      tournamentSlug={tournament.slug}
      tournamentStatus={tournament.status}
      currentRound={tournament.current_round}
      initialPlayers={initialPlayers}
      onStartTournament={handleStartTournament}
      isStarting={isStarting}
    />
  );
}
