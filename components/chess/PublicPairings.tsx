'use client';

import { useState } from 'react';
import { Card, Group, Text, Badge, Stack, Tabs, Paper } from '@mantine/core';
import type { GameResult } from '@/types/database';

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
}

export function PublicPairings({ rounds, currentRound }: PublicPairingsProps) {
  const [selectedRound, setSelectedRound] = useState<string>(
    String(currentRound || (rounds.length > 0 ? rounds[rounds.length - 1].number : 1))
  );

  const activeRound = rounds.find((r) => r.number === Number(selectedRound));

  const formatResultBadge = (result: GameResult, isBye: boolean) => {
    if (isBye) return <Badge color="blue">1 - 0 (BYE)</Badge>;
    switch (result) {
      case 'white_win':
      case 'black_forfeit_win':
        return <Badge color="yellow" variant="filled">1 - 0</Badge>;
      case 'black_win':
      case 'white_forfeit_win':
        return <Badge color="yellow" variant="filled">0 - 1</Badge>;
      case 'draw':
        return <Badge color="blue" variant="filled">½ - ½</Badge>;
      case 'double_forfeit':
        return <Badge color="red">0F - 0F</Badge>;
      default:
        return <Badge color="gray" variant="outline">vs</Badge>;
    }
  };

  return (
    <Stack gap="md">
      <Tabs value={selectedRound} onChange={(v) => v && setSelectedRound(v)} color="yellow">
        <Tabs.List>
          {rounds.map((r) => (
            <Tabs.Tab key={r.number} value={String(r.number)}>
              Round {r.number}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {!activeRound || activeRound.games.length === 0 ? (
        <Paper p="xl" ta="center" withBorder radius="md">
          <Text c="dimmed">No pairings published for this round yet.</Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {activeRound.games.map((game) => {
            const isBye = game.result === 'bye' || !game.blackId;
            return (
              <Card key={game.id} withBorder shadow="xs" padding="md" radius="md">
                <Group justify="space-between" align="center" wrap="wrap">
                  <Badge size="md" variant="light" color="gray">
                    Board {game.board}
                  </Badge>

                  <Group gap="xl" align="center" style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <Text fw={600} size="sm">
                        {game.whiteName}
                      </Text>
                      {game.whiteRating && (
                        <Text size="xs" c="dimmed">
                          ({game.whiteRating})
                        </Text>
                      )}
                    </div>

                    <div>{formatResultBadge(game.result, isBye)}</div>

                    <div style={{ flex: 1 }}>
                      {isBye ? (
                        <Badge color="blue" variant="outline">
                          BYE
                        </Badge>
                      ) : (
                        <>
                          <Text fw={600} size="sm">
                            {game.blackName || 'TBD'}
                          </Text>
                          {game.blackRating && (
                            <Text size="xs" c="dimmed">
                              ({game.blackRating})
                            </Text>
                          )}
                        </>
                      )}
                    </div>
                  </Group>
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
