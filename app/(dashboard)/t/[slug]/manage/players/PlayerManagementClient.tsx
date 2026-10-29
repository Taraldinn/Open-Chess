'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notify } from '@/lib/notify';
import { PlayerList, PlayerItem } from '@/components/players/PlayerList';
import { RegistrationRequestsCard } from '@/components/players/RegistrationRequestsCard';
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
        notify({
          title: 'Tournament Started!',
          message: 'Round 1 pairings generated successfully.',
          color: 'green',
        });
        router.push(`/t/${tournament.slug}/manage/rounds`);
      }
    } catch (err: any) {
      notify({
        title: 'Could Not Start Tournament',
        message: err.message,
        color: 'red',
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <RegistrationRequestsCard
        tournamentId={tournament.id}
        tournamentSlug={tournament.slug}
        settings={tournament.settings}
        onPlayerAccepted={() => router.refresh()}
      />

      <PlayerList
        tournamentId={tournament.id}
        tournamentSlug={tournament.slug}
        tournamentStatus={tournament.status}
        currentRound={tournament.current_round}
        initialPlayers={initialPlayers}
        onStartTournament={handleStartTournament}
        isStarting={isStarting}
      />
    </div>
  );
}
