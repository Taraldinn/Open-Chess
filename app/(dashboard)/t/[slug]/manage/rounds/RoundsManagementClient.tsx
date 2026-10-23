'use client';

import { useState } from 'react';
import {
  Card,
  Group,
  Title,
  Text,
  Badge,
  Button,
  Stack,
  Tabs,
  Progress,
  Paper,
  Alert,
} from '@mantine/core';
import {
  IconCheck,
  IconFlame,
  IconArrowRight,
  IconShare,
  IconAlertCircle,
  IconTrophy,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
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
      notifications.show({
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
      notifications.show({
        title: 'Round Published',
        message: `Round ${activeRound.number} is now visible to the public.`,
        color: 'green',
      });
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err.message, color: 'red' });
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
          notifications.show({
            title: 'Tournament Finished!',
            message: 'All scheduled rounds are complete. Final standings calculated.',
            color: 'yellow',
          });
        } else {
          notifications.show({
            title: `Round ${res.roundNumber} Generated!`,
            message: 'Pairings ready for review and entry.',
            color: 'green',
          });
          setActiveRoundNumber(String(res.roundNumber));
        }
        router.refresh();
      }
    } catch (err: any) {
      notifications.show({
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
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={3}>Round Management</Title>
          <Text size="sm" c="dimmed">
            Enter results for each board. Standings and pairings calculate automatically.
          </Text>
        </div>

        <Group>
          {activeRound?.status === 'draft' && (
            <Button
              variant="light"
              color="blue"
              onClick={handlePublishRound}
              loading={loadingAction}
            >
              Publish Round {activeRound.number}
            </Button>
          )}

          {isCurrentActiveRound && (
            <Button
              color="yellow"
              c="dark.9"
              fw={700}
              disabled={!allCurrentGamesFinished}
              onClick={handleGenerateNextRound}
              loading={loadingAction}
              rightSection={isFinalRound ? <IconTrophy size={18} /> : <IconArrowRight size={18} />}
            >
              {isFinalRound ? 'Complete Tournament' : `Generate Round ${tournament.current_round + 1}`}
            </Button>
          )}
        </Group>
      </Group>

      {/* Round Tabs */}
      <Tabs
        value={activeRoundNumber}
        onChange={(v) => v && setActiveRoundNumber(v)}
        color="yellow"
        variant="pills"
      >
        <Tabs.List>
          {rounds.map((r) => (
            <Tabs.Tab
              key={r.number}
              value={String(r.number)}
              rightSection={
                r.status === 'completed' ? (
                  <IconCheck size={14} color="var(--mantine-color-green-5)" />
                ) : r.status === 'published' ? (
                  <Badge size="xs" color="blue" variant="light">
                    Live
                  </Badge>
                ) : (
                  <Badge size="xs" color="gray" variant="light">
                    Draft
                  </Badge>
                )
              }
            >
              Round {r.number}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {/* Round Status Banner & Progress */}
      {activeRound && (
        <Card withBorder padding="md" radius="lg" className="playful-card-glow">
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <Text fw={700}>Round {activeRound.number} Progress:</Text>
              <Text size="sm" c="dimmed">
                {completedGamesInActiveRound} / {totalGamesInActiveRound} Boards Finished
              </Text>
            </Group>
            <Badge
              color={activeRound.status === 'completed' ? 'green' : 'blue'}
              variant="filled"
            >
              {activeRound.status.toUpperCase()}
            </Badge>
          </Group>
          <Progress value={progressPercent} color="yellow" size="md" radius="xl" />
        </Card>
      )}

      {/* Boards List */}
      {!activeRound || activeRound.games.length === 0 ? (
        <Paper p="xl" ta="center" withBorder radius="md">
          <Text c="dimmed">No pairings generated for this round yet.</Text>
        </Paper>
      ) : (
        <Stack gap="md">
          {activeRound.games.map((game) => (
            <PairingBoard
              key={game.id}
              game={game}
              onSetResult={handleSetResult}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
