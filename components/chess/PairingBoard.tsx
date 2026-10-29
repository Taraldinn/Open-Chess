'use client';

import { Card, Group, Text, Badge, Stack } from '@mantine/core';
import type { GameResult } from '@/types/database';
import { ResultButtons } from './ResultButtons';
import { ColorChip } from './ColorChip';

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

function PlayerRow({
  color,
  name,
  rating,
}: {
  color: 'white' | 'black';
  name: string;
  rating?: number | null;
}) {
  return (
    <Group gap="sm" wrap="nowrap" align="center">
      <div style={{ width: 74 }}>
        <ColorChip color={color} />
      </div>
      <Text fw={700} size="sm" style={{ minWidth: 0, wordBreak: 'break-word' }}>
        {name}
        {rating ? (
          <Text component="span" size="xs" c="dimmed" ml={6}>
            ({rating})
          </Text>
        ) : null}
      </Text>
    </Group>
  );
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
      className={isFinished ? 'playful-finished-game' : undefined}
    >
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Stack gap={8} style={{ flex: 1, minWidth: 220 }}>
          <Badge
            size="md"
            variant={isFinished ? 'light' : 'filled'}
            color={isFinished ? 'mintJoy' : 'yellow'}
            w="fit-content"
          >
            Board {game.board}
          </Badge>

          <PlayerRow
            color="white"
            name={game.whitePlayer?.name || 'Unknown'}
            rating={game.whitePlayer?.rating}
          />
          {isBye ? (
            <Badge color="arcadeViolet" variant="light" w="fit-content">
              BYE
            </Badge>
          ) : (
            <PlayerRow
              color="black"
              name={game.blackPlayer?.name || 'Unknown'}
              rating={game.blackPlayer?.rating}
            />
          )}
        </Stack>

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
