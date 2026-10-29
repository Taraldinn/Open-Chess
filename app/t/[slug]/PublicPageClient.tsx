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
  Box,
  Progress,
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
  IconHome,
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
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [shareModalOpened, setShareModalOpened] = useState(false);

  const gamesPlayed = allGames.filter((g) => g.result !== 'unplayed').length;
  const gamesTotal = allGames.length;
  const activePlayers = players.filter((p) => p.status === 'active').length;
  const roundPct = tournament.total_rounds
    ? Math.min(100, Math.round((tournament.current_round / tournament.total_rounds) * 100))
    : 0;
  const leaders = standings.slice(0, 3);
  const isFinished = tournament.status === 'finished';

  return (
    <Container size="lg" py={{ base: 'md', sm: 'xl' }}>
      <Card className="hero-card" padding="lg" radius="lg" mb="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" mb={8} wrap="wrap">
              <Badge color="yellow" variant="filled" size="sm" tt="uppercase">
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
                size="sm"
              >
                {tournament.status === 'draft'
                  ? 'DRAFT'
                  : tournament.status === 'running'
                  ? 'LIVE'
                  : tournament.status.toUpperCase()}
              </Badge>
              <RealtimeListener tournamentId={tournament.id} />
            </Group>
            <Title order={1} fw={900} mb={6} style={{ fontSize: 'clamp(1.4rem, 5vw, 2.4rem)' }}>
              {tournament.name}
            </Title>
            {tournament.description && (
              <Text size="sm" c="dimmed" mb="xs" lineClamp={3}>
                {tournament.description}
              </Text>
            )}
            <Group gap="md" wrap="wrap">
              {tournament.time_control && (
                <Group gap={4}>
                  <IconClock size={14} />
                  <Text size="sm" c="dimmed">{tournament.time_control}</Text>
                </Group>
              )}
              {tournament.venue && (
                <Group gap={4}>
                  <IconMapPin size={14} />
                  <Text size="sm" c="dimmed">{tournament.venue}</Text>
                </Group>
              )}
            </Group>
          </Box>

          <Group gap="xs" wrap="wrap">
            <Button
              variant="default"
              size="sm"
              leftSection={<IconShare size={14} />}
              onClick={() => setShareModalOpened(true)}
            >
              Share
            </Button>
            <Link href={`/t/${tournament.slug}/manage/rounds`} style={{ textDecoration: 'none' }}>
              <Button variant="default" size="sm">
                Arbiter
              </Button>
            </Link>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mt="lg">
          <div className="stat-tile">
            <div className="stat-tile__value">{activePlayers}</div>
            <div className="stat-tile__label">Players</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__value">
              {tournament.current_round}/{tournament.total_rounds}
            </div>
            <div className="stat-tile__label">Round</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__value">
              {gamesPlayed}
              <Text component="span" size="sm" c="dimmed"> / {gamesTotal}</Text>
            </div>
            <div className="stat-tile__label">Games played</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__value">{leaders[0] ? leaders[0].score : '-'}</div>
            <div className="stat-tile__label">Top score</div>
          </div>
        </SimpleGrid>
        <Progress value={roundPct} color="yellow" size="sm" radius="xl" mt="md" />
      </Card>

      <Tabs value={activeTab} onChange={(v) => v && setActiveTab(v)} color="yellow" variant="pills">
        <Box className="scroll-x" mb="lg">
          <Tabs.List style={{ flexWrap: 'nowrap', paddingBottom: 4 }}>
            <Tabs.Tab value="overview" leftSection={<IconHome size={14} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="pairings" leftSection={<IconFlame size={14} />}>
              Pairings
            </Tabs.Tab>
            <Tabs.Tab value="standings" leftSection={<IconTrophy size={14} />}>
              Standings
            </Tabs.Tab>
            <Tabs.Tab value="crosstable" leftSection={<IconChartBar size={14} />}>
              Crosstable
            </Tabs.Tab>
            <Tabs.Tab value="players" leftSection={<IconUsers size={14} />}>
              Players ({players.length})
            </Tabs.Tab>
            <Tabs.Tab value="info" leftSection={<IconInfoCircle size={14} />}>
              Info
            </Tabs.Tab>
          </Tabs.List>
        </Box>

        <Tabs.Panel value="overview">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Card withBorder padding="md" radius="md">
              <Group justify="space-between" mb="sm">
                <Title order={4}>{isFinished ? 'Final podium' : 'Leaderboard'}</Title>
                <Button variant="subtle" size="xs" onClick={() => setActiveTab('standings')}>
                  Full standings
                </Button>
              </Group>
              {leaders.length === 0 ? (
                <Text c="dimmed" size="sm">Standings appear once results are in.</Text>
              ) : (
                <Stack gap="xs">
                  {leaders.map((row) => (
                    <Group
                      key={row.playerId}
                      justify="space-between"
                      wrap="nowrap"
                      p="xs"
                      style={{
                        border: '1px solid var(--mantine-color-default-border)',
                        borderRadius: 10,
                      }}
                    >
                      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                        <Text fw={900} size="lg" w={28}>
                          {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : `#${row.rank}`}
                        </Text>
                        <Box style={{ minWidth: 0 }}>
                          <Text
                            component={Link}
                            href={`/t/${tournament.slug}/players/${row.playerId}`}
                            fw={700}
                            size="sm"
                            style={{ textDecoration: 'none', wordBreak: 'break-word' }}
                          >
                            {row.playerName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {row.wins}W {row.draws}D {row.losses}L
                          </Text>
                        </Box>
                      </Group>
                      <Badge size="lg" variant="light" color="yellow">
                        {row.score} pts
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              )}
            </Card>

            <Card withBorder padding="md" radius="md">
              <Group justify="space-between" mb="sm">
                <Title order={4}>Round {tournament.current_round || 1} boards</Title>
                <Button variant="subtle" size="xs" onClick={() => setActiveTab('pairings')}>
                  All pairings
                </Button>
              </Group>
              <PublicPairings
                rounds={publicRounds}
                currentRound={tournament.current_round}
                limit={4}
                hideRoundTabs
              />
            </Card>
          </SimpleGrid>
        </Tabs.Panel>

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

      <Text size="xs" c="dimmed" ta="center" mt="xl">
        Powered by OpenVChess ·{' '}
        <a
          href="https://github.com/Taraldinn"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', fontWeight: 700 }}
        >
          github.com/Taraldinn
        </a>
      </Text>

      <ExportShareModal
        opened={shareModalOpened}
        onClose={() => setShareModalOpened(false)}
        tournamentSlug={tournament.slug}
        tournamentName={tournament.name}
      />
    </Container>
  );
}
