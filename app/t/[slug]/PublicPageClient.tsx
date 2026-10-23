'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Badge,
  Group,
  Tabs,
  Card,
  SimpleGrid,
  Button,
  Stack,
  Table,
} from '@mantine/core';
import {
  IconFlame,
  IconTrophy,
  IconChartBar,
  IconUsers,
  IconInfoCircle,
  IconShare,
  IconMapPin,
  IconClock,
} from '@tabler/icons-react';
import Link from 'next/link';
import { PublicPairings, PublicRoundItem } from '@/components/chess/PublicPairings';
import { StandingsTable } from '@/components/chess/StandingsTable';
import { Crosstable } from '@/components/chess/Crosstable';
import { RealtimeListener } from '@/components/chess/RealtimeListener';
import { ExportShareModal } from '@/components/chess/ExportShareModal';
import type { PastGame, PlayerInfo, StandingRow } from '@/lib/formats';

interface Props {
  tournament: any;
  players: PlayerInfo[];
  allGames: PastGame[];
  publicRounds: PublicRoundItem[];
  standings: StandingRow[];
}

export function PublicPageClient({
  tournament,
  players,
  allGames,
  publicRounds,
  standings,
}: Props) {
  const [activeTab, setActiveTab] = useState<string>('pairings');
  const [shareModalOpened, setShareModalOpened] = useState(false);

  return (
    <Container size="lg" py="xl">
      {/* Header */}
      <Stack gap="md" mb="xl">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Group gap="xs" mb="xs">
              <Title order={1} size="2.2rem" fw={900}>
                {tournament.name}
              </Title>
              <Badge color="yellow" c="dark.9" variant="filled" size="md" tt="uppercase">
                {tournament.format.replace(/_/g, ' ')}
              </Badge>
              <Badge
                color={
                  tournament.status === 'running'
                    ? 'green'
                    : tournament.status === 'finished'
                    ? 'gray'
                    : 'arcadeViolet'
                }
                variant="light"
                size="md"
              >
                {tournament.status === 'draft' ? '✏️ DRAFT' : tournament.status === 'running' ? '⚡ LIVE' : tournament.status.toUpperCase()}
              </Badge>
            </Group>

            <Group gap="md">
              {tournament.time_control && (
                <Group gap={4}>
                  <IconClock size={16} color="gray" />
                  <Text size="sm" c="dimmed">
                    {tournament.time_control}
                  </Text>
                </Group>
              )}
              {tournament.venue && (
                <Group gap={4}>
                  <IconMapPin size={16} color="gray" />
                  <Text size="sm" c="dimmed">
                    {tournament.venue}
                  </Text>
                </Group>
              )}
              <Text size="sm" c="dimmed">
                Round: {tournament.current_round} / {tournament.total_rounds}
              </Text>
            </Group>
          </div>

          <Group>
            <RealtimeListener tournamentId={tournament.id} />
            <Button
              variant="light"
              color="yellow"
              leftSection={<IconShare size={16} />}
              onClick={() => setShareModalOpened(true)}
            >
              Share & QR
            </Button>
            <Link
              href={`/t/${tournament.slug}/manage/rounds`}
              style={{ textDecoration: 'none' }}
            >
              <Button variant="default" size="sm">
                Arbiter View
              </Button>
            </Link>
          </Group>
        </Group>
      </Stack>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(v) => v && setActiveTab(v)} color="yellow" variant="pills">
        <Tabs.List mb="lg">
          <Tabs.Tab value="pairings" leftSection={<IconFlame size={16} />}>
            Pairings & Results
          </Tabs.Tab>
          <Tabs.Tab value="standings" leftSection={<IconTrophy size={16} />}>
            Standings
          </Tabs.Tab>
          <Tabs.Tab value="crosstable" leftSection={<IconChartBar size={16} />}>
            Crosstable
          </Tabs.Tab>
          <Tabs.Tab value="players" leftSection={<IconUsers size={16} />}>
            Players ({players.length})
          </Tabs.Tab>
          <Tabs.Tab value="info" leftSection={<IconInfoCircle size={16} />}>
            Info & Rules
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pairings">
          <PublicPairings
            rounds={publicRounds}
            currentRound={tournament.current_round}
          />
        </Tabs.Panel>

        <Tabs.Panel value="standings">
          <Card withBorder padding="md" radius="md">
            <StandingsTable
              standings={standings}
              tournamentSlug={tournament.slug}
            />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="crosstable">
          <Card withBorder padding="md" radius="md">
            <Crosstable
              standings={standings}
              games={allGames}
              totalRounds={tournament.total_rounds}
            />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="players">
          <Card withBorder padding="md" radius="md">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 60 }}>Seed</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th style={{ width: 100 }}>Rating</Table.Th>
                  <Table.Th>Club / Country</Table.Th>
                  <Table.Th style={{ width: 100 }}>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {players.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td fw={700}>#{p.seed}</Table.Td>
                    <Table.Td>
                      <Text
                        component={Link}
                        href={`/t/${tournament.slug}/players/${p.id}`}
                        fw={600}
                        c="yellow.4"
                      >
                        {p.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>{p.rating || '-'}</Table.Td>
                    <Table.Td>{p.club || '-'}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={p.status === 'active' ? 'green' : 'red'}
                        size="sm"
                        variant="light"
                      >
                        {p.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="info">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <Card withBorder padding="lg" radius="md">
              <Title order={4} mb="xs">
                Tournament Details
              </Title>
              <Stack gap="xs">
                <div>
                  <Text size="xs" c="dimmed">
                    FORMAT
                  </Text>
                  <Text fw={600} tt="capitalize">
                    {tournament.format.replace(/_/g, ' ')}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    TOTAL ROUNDS
                  </Text>
                  <Text fw={600}>{tournament.total_rounds} Rounds</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    TIME CONTROL
                  </Text>
                  <Text fw={600}>{tournament.time_control || 'Unspecified'}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    VENUE
                  </Text>
                  <Text fw={600}>{tournament.venue || 'Online'}</Text>
                </div>
              </Stack>
            </Card>

            <Card withBorder padding="lg" radius="md">
              <Title order={4} mb="xs">
                Scoring & Tie-breaks
              </Title>
              <Stack gap="xs">
                <div>
                  <Text size="xs" c="dimmed">
                    POINTS SYSTEM
                  </Text>
                  <Text fw={600}>
                    Win: {tournament.settings?.winPoints ?? 1} pt | Draw:{' '}
                    {tournament.settings?.drawPoints ?? 0.5} pt | Bye:{' '}
                    {tournament.settings?.byePoints ?? 1} pt
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    TIE-BREAK ORDER
                  </Text>
                  <Group gap={6} mt={4}>
                    {(tournament.settings?.tieBreaks || ['buchholz', 'sonneborn_berger', 'wins']).map(
                      (tb: string) => (
                        <Badge key={tb} variant="outline" color="yellow" size="sm">
                          {tb.replace(/_/g, ' ')}
                        </Badge>
                      )
                    )}
                  </Group>
                </div>
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>

      <ExportShareModal
        opened={shareModalOpened}
        onClose={() => setShareModalOpened(false)}
        tournamentSlug={tournament.slug}
        tournamentName={tournament.name}
      />
    </Container>
  );
}
