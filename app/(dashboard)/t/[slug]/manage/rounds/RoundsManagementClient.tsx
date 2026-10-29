'use client';

import { useState } from 'react';
import { ArrowRightIcon, CheckIcon, Loader2Icon, TrophyIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notify } from '@/lib/notify';
import { useRouter } from 'next/navigation';
import { PairingBoard, BoardGameItem } from '@/components/chess/PairingBoard';
import {
  setGameResultAction,
  generateNextRoundAction,
  publishRoundAction,
} from '@/lib/actions/rounds';
import type { GameResult } from '@/types/database';

interface RoundItem {
  id: string;
  number: number;
  status: 'draft' | 'published' | 'completed';
  games: BoardGameItem[];
}

interface Props {
  tournament: any;
  initialRounds: RoundItem[];
}

export function RoundsManagementClient({ tournament, initialRounds }: Props) {
  const router = useRouter();
  const [rounds, setRounds] = useState<RoundItem[]>(initialRounds);
  const [activeRoundNumber, setActiveRoundNumber] = useState<string>(
    String(tournament.current_round || 1)
  );
  const [loadingAction, setLoadingAction] = useState(false);

  const activeRound = rounds.find((r) => r.number === Number(activeRoundNumber));

  const handleSetResult = async (gameId: string, result: GameResult) => {
    // Optimistic update
    setRounds((prev) =>
      prev.map((r) => ({
        ...r,
        games: r.games.map((g) => (g.id === gameId ? { ...g, result } : g)),
      }))
    );

    try {
      await setGameResultAction(gameId, result);
    } catch (err: any) {
      notify({
        title: 'Error Saving Result',
        message: err.message,
        color: 'red',
      });
      router.refresh();
    }
  };

  const handlePublishRound = async () => {
    if (!activeRound) return;
    setLoadingAction(true);
    try {
      await publishRoundAction(activeRound.id);
      setRounds((prev) =>
        prev.map((r) => (r.id === activeRound.id ? { ...r, status: 'published' } : r))
      );
      notify({
        title: 'Round Published',
        message: `Round ${activeRound.number} is now visible to the public.`,
        color: 'green',
      });
    } catch (err: any) {
      notify({ title: 'Error', message: err.message, color: 'red' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleGenerateNextRound = async () => {
    setLoadingAction(true);
    try {
      const res = await generateNextRoundAction(tournament.id);
      if (res.success) {
        if (res.finished) {
          notify({
            title: 'Tournament Finished!',
            message: 'All scheduled rounds are complete. Final standings calculated.',
            color: 'yellow',
          });
        } else {
          notify({
            title: `Round ${res.roundNumber} Generated!`,
            message: 'Pairings ready for review and entry.',
            color: 'green',
          });
          setActiveRoundNumber(String(res.roundNumber));
        }
        router.refresh();
      }
    } catch (err: any) {
      notify({
        title: 'Cannot Generate Next Round',
        message: err.message,
        color: 'red',
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const totalGamesInActiveRound = activeRound?.games.length || 0;
  const completedGamesInActiveRound =
    activeRound?.games.filter((g) => g.result !== 'unplayed').length || 0;
  const progressPercent =
    totalGamesInActiveRound > 0
      ? (completedGamesInActiveRound / totalGamesInActiveRound) * 100
      : 0;

  const isCurrentActiveRound = activeRound?.number === tournament.current_round;
  const allCurrentGamesFinished =
    totalGamesInActiveRound > 0 && completedGamesInActiveRound === totalGamesInActiveRound;
  const isFinalRound = tournament.current_round >= tournament.total_rounds;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Round management</h2>
          <p className="text-sm text-muted-foreground">
            Enter results for each board. Standings and pairings calculate automatically.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeRound?.status === 'draft' && (
            <Button variant="outline" onClick={handlePublishRound} disabled={loadingAction}>
              {loadingAction && <Loader2Icon className="animate-spin" />}
              Publish round {activeRound.number}
            </Button>
          )}

          {isCurrentActiveRound && (
            <Button
              disabled={!allCurrentGamesFinished || loadingAction}
              onClick={handleGenerateNextRound}
            >
              {loadingAction && <Loader2Icon className="animate-spin" />}
              {isFinalRound ? 'Complete tournament' : `Generate round ${tournament.current_round + 1}`}
              {isFinalRound ? <TrophyIcon /> : <ArrowRightIcon />}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Tabs value={activeRoundNumber} onValueChange={(v) => v && setActiveRoundNumber(String(v))}>
          <TabsList className="w-max">
            {rounds.map((r) => (
              <TabsTrigger key={r.number} value={String(r.number)} className="gap-2 px-3">
                Round {r.number}
                {r.status === 'completed' ? (
                  <CheckIcon className="size-3.5 text-emerald-600" />
                ) : r.status === 'published' ? (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    Live
                  </Badge>
                ) : (
                  <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                    Draft
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {activeRound && (
        <Card className="gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">
              <span className="font-semibold">Round {activeRound.number} progress:</span>{' '}
              <span className="text-muted-foreground">
                {completedGamesInActiveRound} / {totalGamesInActiveRound} boards finished
              </span>
            </p>
            <Badge variant={activeRound.status === 'completed' ? 'default' : 'secondary'}>
              {activeRound.status.toUpperCase()}
            </Badge>
          </div>
          <Progress value={progressPercent} />
        </Card>
      )}

      {!activeRound || activeRound.games.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No pairings generated for this round yet.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {activeRound.games.map((game) => (
            <PairingBoard key={game.id} game={game} onSetResult={handleSetResult} />
          ))}
        </div>
      )}
    </div>
  );
}
