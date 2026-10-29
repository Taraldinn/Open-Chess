import {
  Container,
  Title,
  Text,
  Badge,
  Group,
  Card,
  SimpleGrid,
  Button,
  Stack,
  Table,
  Paper,
} from '@mantine/core';
import { IconArrowLeft, IconTrophy, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTournamentBySlugAction } from '@/lib/actions/tournaments';
import { computeStandingsEngine } from '@/lib/tiebreaks/engine';
import type { PastGame, PlayerInfo } from '@/lib/formats';

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

export default async function PlayerProfilePage({ params }: Props) {
  const { slug, id } = await params;
  const tournament = await getTournamentBySlugAction(slug);

  if (!tournament) notFound();

  const player = (tournament.players || []).find((p: any) => p.id === id);
  if (!player) notFound();

  const playerMap = new Map<string, any>();
  for (const p of tournament.players || []) {
    playerMap.set(p.id, p);
  }

  const allGames: PastGame[] = [];
  for (const r of tournament.rounds || []) {
    for (const g of r.games || []) {
      allGames.push({
        id: g.id,
        roundNumber: r.number,
        board: g.board,
        whiteId: g.white_id,
        blackId: g.black_id,
        result: g.result,
      });
    }
  }

  const players: PlayerInfo[] = (tournament.players || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    rating: p.rating,
    club: p.club,
    seed: p.seed,
    status: p.status,
  }));

  const standings = computeStandingsEngine({
    players,
    games: allGames,
    settings: tournament.settings,
  });

  const playerStanding = standings.find((s) => s.playerId === id);

  // Filter games involving this player
  const playerGames = allGames
    .filter((g) => g.whiteId === id || g.blackId === id)
    .sort((a, b) => a.roundNumber - b.roundNumber);

  return (
    <Container size="md" py="xl">
      <Link href={`/t/${tournament.slug}`} style={{ textDecoration: 'none' }}>
        <Button
          variant="subtle"
          size="sm"
          className="subtle-nav-btn"
          leftSection={<IconArrowLeft size={16} />}
          mb="md"
        >
          Back to {tournament.name}
        </Button>
      </Link>

      <Card withBorder padding="md" radius="md" mb="xl">
        <Group justify="space-between" align="flex-start" mb="md">
          <div>
            <Group gap="xs" mb="xs">
              <Title order={1} size="2rem" fw={800}>
                {player.name}
              </Title>
              <Badge color="yellow" variant="light" size="sm">
                Seed #{player.seed}
              </Badge>
              {playerStanding && (
                <Badge color="green" size="sm">
                  Rank #{playerStanding.rank}
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              {player.club ? `${player.club} • ` : ''}Rating: {player.rating || 'Unrated'}
            </Text>
          </div>

          <Paper p="md" withBorder radius="md" ta="center">
            <Text size="xs" c="dimmed">
              TOTAL SCORE
            </Text>
            <Title order={2} fw={900} c="yellow.5">
              {playerStanding?.score ?? 0}
            </Title>
          </Paper>
        </Group>

        {playerStanding && playerStanding.colorHistory.length > 0 && (
          <Paper p="sm" radius="md" className="playful-accent-box">
            <Group gap="xs">
              <Text size="xs" fw={700} c="dimmed">
                COLOR SEQUENCE:
              </Text>
              <Group gap={6}>
                {playerStanding.colorHistory.map((col, idx) => (
                  <Group key={idx} gap={2}>
                    <Text size="xs" fw={600} c="dimmed">
                      R{idx + 1}:
                    </Text>
                    <span>{col === 'W' ? '⚪' : '⚫'}</span>
                  </Group>
                ))}
              </Group>
            </Group>
          </Paper>
        )}
      </Card>

      <Title order={3} mb="md">
        Tournament Game History
      </Title>

      {playerGames.length === 0 ? (
        <Paper p="lg" withBorder radius="md" ta="center">
          <Text c="dimmed">No games played yet.</Text>
        </Paper>
      ) : (
        <Card withBorder padding="md" radius="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 70 }}>Round</Table.Th>
                <Table.Th style={{ width: 70 }}>Board</Table.Th>
                <Table.Th style={{ width: 60 }}>Color</Table.Th>
                <Table.Th>Opponent</Table.Th>
                <Table.Th style={{ width: 90 }}>Result</Table.Th>
                <Table.Th style={{ width: 70 }}>Points</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {playerGames.map((g) => {
                const isBye = g.result === 'bye' || g.blackId === null;
                const isWhite = g.whiteId === id;
                const oppId = isWhite ? g.blackId : g.whiteId;
                const opp = oppId ? playerMap.get(oppId) : null;

                let outcomeText = 'Unplayed';
                let outcomeColor = 'gray';
                let pts = 0;

                if (isBye) {
                  outcomeText = '1 - 0 (Bye)';
                  outcomeColor = 'blue';
                  pts = 1;
                } else if (g.result === 'draw') {
                  outcomeText = '½ - ½';
                  outcomeColor = 'blue';
                  pts = 0.5;
                } else if (
                  (isWhite && (g.result === 'white_win' || g.result === 'black_forfeit_win')) ||
                  (!isWhite && (g.result === 'black_win' || g.result === 'white_forfeit_win'))
                ) {
                  outcomeText = 'Won';
                  outcomeColor = 'green';
                  pts = 1;
                } else if (g.result !== 'unplayed') {
                  outcomeText = 'Lost';
                  outcomeColor = 'red';
                  pts = 0;
                }

                return (
                  <Table.Tr key={g.id}>
                    <Table.Td fw={700}>R{g.roundNumber}</Table.Td>
                    <Table.Td>#{g.board}</Table.Td>
                    <Table.Td>{isBye ? '-' : isWhite ? '⚪ White' : '⚫ Black'}</Table.Td>
                    <Table.Td>
                      {isBye ? (
                        <Badge color="blue" variant="light">
                          BYE
                        </Badge>
                      ) : opp ? (
                        <Text
                          component={Link}
                          href={`/t/${tournament.slug}/players/${opp.id}`}
                          fw={500}
                          c="yellow.4"
                        >
                          {opp.name} {opp.rating ? `(${opp.rating})` : ''}
                        </Text>
                      ) : (
                        'Unknown'
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={outcomeColor} size="sm">
                        {outcomeText}
                      </Badge>
                    </Table.Td>
                    <Table.Td fw={700}>{g.result === 'unplayed' ? '-' : pts}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </Container>
  );
}
