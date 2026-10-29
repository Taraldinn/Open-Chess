'use client';

import { useState } from 'react';
import { Card, Group, Text, Badge, Stack, Tabs, Paper, Box } from '@mantine/core';
import type { GameResult } from '@/types/database';
import { ColorChip } from './ColorChip';

export interface PublicBoardItem {
  id: string;
  board: number;
  whiteId: string | null;
  blackId: string | null;
  result: GameResult;
  whiteName: string;
  whiteRating?: number | null;
  blackName?: string | null;
  blackRating?: number | null;
}

export interface PublicRoundItem {
  number: number;
  status: string;
  games: PublicBoardItem[];
}

interface PublicPairingsProps {
  rounds: PublicRoundItem[];
  currentRound: number;
  limit?: number;
  hideRoundTabs?: boolean;
}

export function formatResultBadge(result: GameResult, isBye: boolean) {
  if (isBye) return <Badge color="arcadeViolet" variant="light">1 - 0 (BYE)</Badge>;
  switch (result) {
    case 'white_win':
    case 'black_forfeit_win':
      return <Badge color="yellow" variant="filled">1 - 0</Badge>;
    case 'black_win':
    case 'white_forfeit_win':
      return <Badge color="yellow" variant="filled">0 - 1</Badge>;
    case 'draw':
      return <Badge color="arcadeViolet" variant="filled">½ - ½</Badge>;
    case 'double_forfeit':
      return <Badge color="red" variant="filled">0F - 0F</Badge>;
    default:
      return <Badge color="gray" variant="light">Pending</Badge>;
  }
}

function SideRow({
  color,
  name,
  rating,
}: {
  color: 'white' | 'black';
  name: string;
  rating?: number | null;
}) {
  return (
    <Group gap="sm" wrap="nowrap">
      <div style={{ width: 74 }}>
        <ColorChip color={color} />
      </div>
      <Text fw={600} size="sm" style={{ minWidth: 0, wordBreak: 'break-word' }}>
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

export function PublicPairings({
  rounds,
  currentRound,
  limit,
  hideRoundTabs,
}: PublicPairingsProps) {
  const [selectedRound, setSelectedRound] = useState<string>(
    String(currentRound || (rounds.length > 0 ? rounds[rounds.length - 1].number : 1))
  );

  const activeRound = rounds.find((r) => r.number === Number(selectedRound));
  const games = activeRound ? (limit ? activeRound.games.slice(0, limit) : activeRound.games) : [];

  return (
    <Stack gap="md">
      {!hideRoundTabs && (
        <Tabs
          value={selectedRound}
          onChange={(v) => v && setSelectedRound(v)}
          color="yellow"
          variant="pills"
        >
          <Box className="scroll-x">
            <Tabs.List style={{ flexWrap: 'nowrap', paddingBottom: 4 }}>
              {rounds.map((r) => (
                <Tabs.Tab key={r.number} value={String(r.number)}>
                  Round {r.number}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Box>
        </Tabs>
      )}

      {!activeRound || games.length === 0 ? (
        <Paper p="xl" ta="center" withBorder radius="md">
          <Text c="dimmed">No pairings published for this round yet.</Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {games.map((game) => {
            const isBye = game.result === 'bye' || !game.blackId;
            return (
              <Card key={game.id} withBorder shadow="xs" padding="md" radius="md">
                <Group justify="space-between" align="center" mb={8}>
                  <Badge size="md" variant="light" color="gray">
                    Board {game.board}
                  </Badge>
                  {formatResultBadge(game.result, isBye)}
                </Group>
                <Stack gap={6}>
                  <SideRow color="white" name={game.whiteName} rating={game.whiteRating} />
                  {isBye ? (
                    <Badge color="blue" variant="outline" w="fit-content">
                      BYE
                    </Badge>
                  ) : (
                    <SideRow
                      color="black"
                      name={game.blackName || 'TBD'}
                      rating={game.blackRating}
                    />
                  )}
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
