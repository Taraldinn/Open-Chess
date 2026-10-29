'use client';

import { useState } from 'react';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2Icon,
  RefreshCwIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
  TrophyIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notify } from '@/lib/notify';
import { useRouter } from 'next/navigation';
import { PairingBoard, BoardGameItem } from '@/components/chess/PairingBoard';
import {
  setGameResultAction,
  generateNextRoundAction,
  publishRoundAction,
  undoDrawAction,
  redoDrawAction,
} from '@/lib/actions/rounds';
import type { GameResult } from '@/types/database';

interface RoundItem {
  id: string;
  number: number;
  status: 'draft' | 'published' | 'completed';
  pairing_method?: string | null;
  games: BoardGameItem[];
}

interface Props {
  tournament: any;
  initialRounds: RoundItem[];
}

const PAIRING_METHODS = [
  { value: 'swiss_dutch', label: 'FIDE Swiss (Dutch / Score Brackets)' },
  { value: 'swiss_seeded', label: 'Seeded Swiss (Rating Top-Half vs Bottom-Half)' },
  { value: 'swiss_random', label: 'Random Swiss (Random Within Score Groups)' },
  { value: 'round_robin', label: 'Round Robin (Berger Tables)' },
  { value: 'knockout', label: 'Knockout (Bracket Elimination)' },
];

export function RoundsManagementClient({ tournament, initialRounds }: Props) {
  const router = useRouter();
  const [rounds, setRounds] = useState<RoundItem[]>(initialRounds);
  const [currentTournamentRound, setCurrentTournamentRound] = useState<number>(
    tournament.current_round || (initialRounds.length > 0 ? initialRounds[initialRounds.length - 1].number : 1)
  );
  const [activeRoundNumber, setActiveRoundNumber] = useState<string>(
    String(currentTournamentRound || 1)
  );
  const [loadingAction, setLoadingAction] = useState(false);

  // Round-wise pairing method state
  const roundMethodsFromSettings = tournament.settings?.roundPairingMethods || {};
  const [selectedPairingMethod, setSelectedPairingMethod] = useState<string>(
    roundMethodsFromSettings[activeRoundNumber] ||
      rounds.find((r) => String(r.number) === activeRoundNumber)?.pairing_method ||
      tournament.format ||
      'swiss_dutch'
  );

  // Confirm dialogs
  const [confirmUndoOpen, setConfirmUndoOpen] = useState(false);
  const [confirmRedoOpen, setConfirmRedoOpen] = useState(false);

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
      const res = await generateNextRoundAction(tournament.id, {
        pairingMethod: selectedPairingMethod,
      });
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
            message: `Pairings ready using ${formatMethodName(selectedPairingMethod)}.`,
            color: 'green',
          });
          setCurrentTournamentRound(res.roundNumber);
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

  const handleUndoDraw = async () => {
    setConfirmUndoOpen(false);
    setLoadingAction(true);
    try {
      const res = await undoDrawAction(tournament.id);
      if (res.success) {
        notify({
          title: 'Draw Undone',
          message:
            res.newCurrentRound === 0
              ? 'Round 1 draw was undone. Tournament reverted to draft.'
              : `Round pairings rolled back to Round ${res.newCurrentRound}.`,
          color: 'blue',
        });

        if (res.newCurrentRound === 0) {
          // Reverted to pre-start: redirect to players page
          router.push(`/t/${tournament.slug}/manage/players`);
        } else {
          setCurrentTournamentRound(res.newCurrentRound);
          setActiveRoundNumber(String(res.newCurrentRound));
          router.refresh();
        }
      }
    } catch (err: any) {
      notify({
        title: 'Undo Draw Failed',
        message: err.message,
        color: 'red',
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRedoDraw = async () => {
    setConfirmRedoOpen(false);
    if (!activeRound) return;
    setLoadingAction(true);
    try {
      const res = await redoDrawAction(tournament.id, {
        roundNumber: activeRound.number,
        pairingMethod: selectedPairingMethod,
      });

      if (res.success) {
        notify({
          title: 'Draw Redone',
          message: `Round ${activeRound.number} re-paired with ${formatMethodName(selectedPairingMethod)}.`,
          color: 'green',
        });
        router.refresh();
      }
    } catch (err: any) {
      notify({
        title: 'Redo Draw Failed',
        message: err.message,
        color: 'red',
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const formatMethodName = (val?: string | null) => {
    const found = PAIRING_METHODS.find((m) => m.value === val);
    if (found) return found.label;
    return (val || 'Swiss').replace(/_/g, ' ');
  };

  const totalGamesInActiveRound = activeRound?.games.length || 0;
  const completedGamesInActiveRound =
    activeRound?.games.filter((g) => g.result !== 'unplayed').length || 0;
  const progressPercent =
    totalGamesInActiveRound > 0
      ? (completedGamesInActiveRound / totalGamesInActiveRound) * 100
      : 0;

  const isCurrentActiveRound = activeRound?.number === currentTournamentRound;
  const allCurrentGamesFinished =
    totalGamesInActiveRound > 0 && completedGamesInActiveRound === totalGamesInActiveRound;
  const isFinalRound = currentTournamentRound >= tournament.total_rounds;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header & Global Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Round management</h2>
          <p className="text-sm text-muted-foreground">
            Manage pairings, switch round pairing methods, undo/redo draws, and enter game results.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeRound?.status === 'draft' && (
            <Button variant="outline" onClick={handlePublishRound} disabled={loadingAction}>
              {loadingAction && <Loader2Icon className="animate-spin" />}
              Publish round {activeRound.number}
            </Button>
          )}

          {/* Draw Redo Button */}
          {isCurrentActiveRound && activeRound && (
            <Button
              variant="outline"
              onClick={() => {
                if (completedGamesInActiveRound > 0) {
                  setConfirmRedoOpen(true);
                } else {
                  handleRedoDraw();
                }
              }}
              disabled={loadingAction}
              className="gap-1.5"
              title="Redo pairings for this round"
            >
              <RefreshCwIcon className="size-4" />
              Redo Draw
            </Button>
          )}

          {/* Draw Undo Button */}
          {isCurrentActiveRound && activeRound && (
            <Button
              variant="outline"
              onClick={() => setConfirmUndoOpen(true)}
              disabled={loadingAction}
              className="gap-1.5 text-destructive hover:bg-destructive/10"
              title="Delete this round's draw and revert"
            >
              <RotateCcwIcon className="size-4" />
              Undo Draw
            </Button>
          )}

          {/* Generate Next Round Button */}
          {isCurrentActiveRound && (
            <Button
              disabled={!allCurrentGamesFinished || loadingAction}
              onClick={handleGenerateNextRound}
            >
              {loadingAction && <Loader2Icon className="animate-spin" />}
              {isFinalRound ? 'Complete tournament' : `Generate round ${currentTournamentRound + 1}`}
              {isFinalRound ? <TrophyIcon className="ml-1 size-4" /> : <ArrowRightIcon className="ml-1 size-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Round Tabs */}
      <div className="overflow-x-auto">
        <Tabs
          value={activeRoundNumber}
          onValueChange={(v) => {
            if (v) {
              setActiveRoundNumber(String(v));
              const roundMethod =
                roundMethodsFromSettings[v] ||
                rounds.find((r) => String(r.number) === v)?.pairing_method ||
                tournament.format ||
                'swiss_dutch';
              setSelectedPairingMethod(roundMethod);
            }
          }}
        >
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

      {/* Active Round Controls & Progress Card */}
      {activeRound && (
        <Card className="gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm">Round {activeRound.number}</span>
              <Badge variant={activeRound.status === 'completed' ? 'default' : 'secondary'}>
                {activeRound.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Method: {formatMethodName(activeRound.pairing_method || selectedPairingMethod)}
              </Badge>
            </div>

            {/* Round-Wise Pairing Method Changing Control */}
            {isCurrentActiveRound && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <SlidersHorizontalIcon className="size-3.5" />
                  Pairing Method:
                </span>
                <Select
                  value={selectedPairingMethod}
                  onValueChange={(val) => val && setSelectedPairingMethod(val)}
                >
                  <SelectTrigger className="h-8 w-64 text-xs">
                    <SelectValue placeholder="Select Pairing Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAIRING_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value} className="text-xs">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeRound.games.length > 0 && selectedPairingMethod !== (activeRound.pairing_method || 'swiss_dutch') && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs gap-1"
                    onClick={handleRedoDraw}
                    disabled={loadingAction}
                  >
                    <RefreshCwIcon className="size-3" />
                    Apply &amp; Redo
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {completedGamesInActiveRound} / {totalGamesInActiveRound} boards completed
              </span>
            </div>
            <Progress value={progressPercent} />
          </div>
        </Card>
      )}

      {/* Boards / Pairings List */}
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

      {/* Confirmation Dialog: Undo Draw */}
      <Dialog open={confirmUndoOpen} onOpenChange={setConfirmUndoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangleIcon className="size-5" />
              <DialogTitle>Undo Round {activeRound?.number} Draw?</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-sm leading-relaxed">
              Undoing the draw will delete all boards, pairings, and any entered results for{' '}
              <strong>Round {activeRound?.number}</strong>.
              {activeRound?.number === 1
                ? ' The tournament will return to Draft state so you can manage players and settings.'
                : ` The tournament will revert back to Round ${Number(activeRound?.number) - 1}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setConfirmUndoOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUndoDraw} disabled={loadingAction}>
              {loadingAction && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              Yes, Undo Draw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog: Redo Draw */}
      <Dialog open={confirmRedoOpen} onOpenChange={setConfirmRedoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <RefreshCwIcon className="size-5" />
              <DialogTitle>Redo Round {activeRound?.number} Draw?</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-sm leading-relaxed">
              Results have already been recorded for some boards in Round {activeRound?.number}. Redoing
              the draw will re-pair the round using <strong>{formatMethodName(selectedPairingMethod)}</strong> and
              reset all results in this round.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setConfirmRedoOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRedoDraw} disabled={loadingAction}>
              {loadingAction && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              Yes, Redo Draw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
