'use client';

import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  SimpleGrid,
  ThemeIcon,
  Badge,
  Box,
} from '@mantine/core';
import {
  IconTrophy,
  IconUsers,
  IconFlame,
  IconChartBar,
  IconArrowRight,
  IconPlayerPlay,
  IconSparkles,
} from '@tabler/icons-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container size="lg" py={{ base: 'lg', sm: 'xl' }}>
      <Stack gap="xl" align="center" my={{ base: 24, sm: 50 }} ta="center">
        <Badge
          size="lg"
          variant="light"
          color="yellow"
          radius="xl"
          leftSection={<IconSparkles size={14} />}
          style={{ padding: '6px 16px', border: '1px solid rgba(250, 176, 5, 0.3)' }}
        >
          ✨ Playful, Fast & Fair Chess Manager
        </Badge>

        <Title order={1} fw={900} style={{ letterSpacing: '-0.03em', lineHeight: 1.15, fontSize: 'clamp(1.8rem, 5vw, 3.5rem)' }}>
          Run Chess Tournaments in{' '}
          <Text component="span" className="playful-gradient-text" inherit>
            Minutes
          </Text>
        </Title>

        <Text c="dimmed" size="lg" maw={660} style={{ lineHeight: 1.6 }}>
          Swiss pairings with perfect Edmonds-Blossom matching, Round Robin tables,
          instant brackets, mobile-ready live score entry, and cheerful public standings.
        </Text>

        {/* Playful Floating Chess Badges */}
        <Group gap="xs" my="xs">
          <Badge size="lg" variant="dot" color="yellow">♟️ Swiss</Badge>
          <Badge size="lg" variant="dot" color="coral">♞ Round Robin</Badge>
          <Badge size="lg" variant="dot" color="arcadeViolet">♛ Knockout</Badge>
          <Badge size="lg" variant="dot" color="mintJoy">⚡ Live Sync</Badge>
        </Group>

        <Group mt="md" gap="sm" justify="center">
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Button
              size="lg"
              color="yellow"
              c="dark.9"
              fw={800}
              radius="xl"
              rightSection={<IconArrowRight size={20} />}
              className="playful-card-glow"
            >
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/t/new" style={{ textDecoration: 'none' }}>
            <Button
              size="lg"
              variant="default"
              radius="xl"
              fw={700}
              leftSection={<IconPlayerPlay size={20} color="#fab005" />}
            >
              Create Tournament
            </Button>
          </Link>
        </Group>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mt={{ base: 32, sm: 60 }}>
        <Card shadow="sm" padding="xl" radius="lg" withBorder className="playful-hover-card">
          <ThemeIcon size={52} radius="xl" color="yellow" variant="light" mb="md">
            <IconTrophy size={30} color="#fab005" />
          </ThemeIcon>
          <Text fw={800} size="lg" mb="xs">
            Multiple Formats
          </Text>
          <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
            Swiss system, Round Robin (single/double), and exciting Single Elimination Knockouts.
          </Text>
        </Card>

        <Card shadow="sm" padding="xl" radius="lg" withBorder className="playful-hover-card">
          <ThemeIcon size={52} radius="xl" color="coral" variant="light" mb="md">
            <IconFlame size={30} color="#ff4d6d" />
          </ThemeIcon>
          <Text fw={800} size="lg" mb="xs">
            Rule-Based Pairings
          </Text>
          <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
            Zero repeat pairings, balanced colors, strict float-down handling, and odd-player byes.
          </Text>
        </Card>

        <Card shadow="sm" padding="xl" radius="lg" withBorder className="playful-hover-card">
          <ThemeIcon size={52} radius="xl" color="arcadeViolet" variant="light" mb="md">
            <IconChartBar size={30} color="#cc5de8" />
          </ThemeIcon>
          <Text fw={800} size="lg" mb="xs">
            Live Standings
          </Text>
          <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
            Buchholz, Sonneborn-Berger, Direct Encounter, and Wins computed automatically in real-time.
          </Text>
        </Card>

        <Card shadow="sm" padding="xl" radius="lg" withBorder className="playful-hover-card">
          <ThemeIcon size={52} radius="xl" color="mintJoy" variant="light" mb="md">
            <IconUsers size={30} color="#20c997" />
          </ThemeIcon>
          <Text fw={800} size="lg" mb="xs">
            Public Live Pages
          </Text>
          <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
            No login needed for players and spectators. Live pairings, crosstables, and quick QR codes.
          </Text>
        </Card>
      </SimpleGrid>

    </Container>
  );
}
