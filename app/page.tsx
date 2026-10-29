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
          size="md"
          variant="light"
          color="yellow"
          radius="sm"
          leftSection={<IconSparkles size={14} />}
        >
          Fast, fair chess tournament manager
        </Badge>

        <Title order={1} fw={900} style={{ letterSpacing: '-0.025em', lineHeight: 1.15, fontSize: 'clamp(1.6rem, 5vw, 1.8rem)' }}>
          Run Chess Tournaments in{' '}
          <Text component="span" className="playful-gradient-text" inherit>
            Minutes
          </Text>
        </Title>

        <Text c="dimmed" size="md" maw={660} style={{ lineHeight: 1.6 }}>
          Swiss pairings with perfect Edmonds-Blossom matching, Round Robin tables,
          instant brackets, mobile-ready live score entry, and public standings.
        </Text>

        {/* Playful Floating Chess Badges */}
        <Group gap="xs" my="xs">
          <Badge size="sm" variant="dot" color="yellow">Swiss</Badge>
          <Badge size="sm" variant="dot" color="coral">Round Robin</Badge>
          <Badge size="sm" variant="dot" color="arcadeViolet">Knockout</Badge>
          <Badge size="sm" variant="dot" color="mintJoy">Live Sync</Badge>
        </Group>

        <Group mt="md" gap="sm" justify="center">
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Button
              size="sm"
              color="yellow"
             
              fw={800}
              radius="sm"
              rightSection={<IconArrowRight size={20} />}
              className="playful-card-glow"
            >
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/t/new" style={{ textDecoration: 'none' }}>
            <Button
              size="sm"
              variant="default"
              radius="sm"
              fw={700}
              leftSection={<IconPlayerPlay size={20} color="var(--accent)" />}
            >
              Create Tournament
            </Button>
          </Link>
        </Group>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mt={{ base: 32, sm: 60 }}>
        <Card shadow="sm" padding="md" radius="md" withBorder className="playful-hover-card">
          <ThemeIcon size={52} radius="sm" color="yellow" variant="light" mb="md">
            <IconTrophy size={30} color="var(--accent)" />
          </ThemeIcon>
          <Text fw={800} size="md" mb="xs">
            Multiple Formats
          </Text>
          <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
            Swiss system, Round Robin (single/double), and exciting Single Elimination Knockouts.
          </Text>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder className="playful-hover-card">
          <ThemeIcon size={52} radius="sm" color="coral" variant="light" mb="md">
            <IconFlame size={30} color="var(--mantine-color-coral-5)" />
          </ThemeIcon>
          <Text fw={800} size="md" mb="xs">
            Rule-Based Pairings
          </Text>
          <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
            Zero repeat pairings, balanced colors, strict float-down handling, and odd-player byes.
          </Text>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder className="playful-hover-card">
          <ThemeIcon size={52} radius="sm" color="arcadeViolet" variant="light" mb="md">
            <IconChartBar size={30} color="var(--mantine-color-arcadeViolet-5)" />
          </ThemeIcon>
          <Text fw={800} size="md" mb="xs">
            Live Standings
          </Text>
          <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
            Buchholz, Sonneborn-Berger, Direct Encounter, and Wins computed automatically in real-time.
          </Text>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder className="playful-hover-card">
          <ThemeIcon size={52} radius="sm" color="mintJoy" variant="light" mb="md">
            <IconUsers size={30} color="var(--mantine-color-mintJoy-5)" />
          </ThemeIcon>
          <Text fw={800} size="md" mb="xs">
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
