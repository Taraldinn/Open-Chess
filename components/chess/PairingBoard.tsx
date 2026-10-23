'use client';

import { Card, Group, Text, Badge, Stack, Box } from '@mantine/core';
import type { GameResult } from '@/types/database';
import { ResultButtons } from './ResultButtons';

export interface BoardGameItem {
  id: string;
  board: number;
  whiteId: string | null;
  blackId: string | null;
  result: GameResult;
  whitePlayer?: {
    name: string;
    rating: number | null;
    club: string | null;
  } | null;
  blackPlayer?: {
    name: string;
    rating: number | null;
    club: string | null;
  } | null;
}

interface PairingBoardProps {
  game: BoardGameItem;
  disabled?: boolean;
  onSetResult: (gameId: string, result: GameResult) => void;
}

export function PairingBoard({ game, disabled, onSetResult }: PairingBoardProps) {
  const isBye = game.result === 'bye' || game.blackId === null;
  const isFinished = game.result !== 'unplayed';

  return (
    <Card
      withBorder
      shadow="xs"
      padding="md"
      radius="md"
      bg={isFinished ? 'var(--mantine-color-dark-7)' : undefined}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        {/* Board Number Badge */}
        <Badge
          size="lg"
          variant="filled"
          color={isFinished ? 'green' : 'gray'}
          style={{ minWidth: 70 }}
        >
          Board {game.board}
        </Badge>

        {/* Players Matchup */}
        <Group gap="xl" align="center" style={{ flex: 1, minWidth: 260 }}>
          {/* White Player */}
          <Box style={{ flex: 1, textAlign: 'right' }}>
            <Group gap="xs" justify="flex-end">
              <div>
                <Text fw={600} size="sm">
                  {game.whitePlayer?.name || 'Unknown'}
                </Text>
                {game.whitePlayer?.rating && (
                  <Text size="xs" c="dimmed">
                    ({game.whitePlayer.rating})
                  </Text>
                )}
              </div>
              <Text size="lg" title="White Pieces">
                ⚪
              </Text>
            </Group>
          </Box>

          <Text size="xs" fw={700} c="dimmed">
            VS
          </Text>

          {/* Black Player */}
          <Box style={{ flex: 1 }}>
            {isBye ? (
              <Badge color="blue" variant="outline">
                BYE
              </Badge>
            ) : (
              <Group gap="xs" justify="flex-start">
                <Text size="lg" title="Black Pieces">
                  ⚫
                </Text>
                <div>
                  <Text fw={600} size="sm">
                    {game.blackPlayer?.name || 'Unknown'}
                  </Text>
                  {game.blackPlayer?.rating && (
                    <Text size="xs" c="dimmed">
                      ({game.blackPlayer.rating})
                    </Text>
                  )}
                </div>
              </Group>
            )}
          </Box>
        </Group>

        {/* Result Action Buttons */}
        <ResultButtons
          currentResult={game.result}
          isBye={isBye}
          disabled={disabled}
          onSetResult={(res) => onSetResult(game.id, res)}
        />
      </Group>
    </Card>
  );
}
