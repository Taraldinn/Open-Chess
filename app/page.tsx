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
} from '@mantine/core';
import {
  IconTrophy,
  IconUsers,
  IconFlame,
  IconChartBar,
  IconArrowRight,
  IconPlayerPlay,
} from '@tabler/icons-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl" align="center" my={60} ta="center">
        <Badge size="lg" variant="light" color="yellow">
          Next-Gen Chess Tournament Manager
        </Badge>
        <Title order={1} size="3.2rem" fw={900}>
          Run Flawless Chess Tournaments in{' '}
          <Text component="span" c="yellow.5" inherit>
            Minutes
          </Text>
        </Title>
        <Text c="dimmed" size="xl" maw={680}>
          Swiss pairings with perfect Edmonds-Blossom matching, Round Robin Berger tables,
          elimination brackets, mobile-ready result entry, and live public standings.
        </Text>
        <Group mt="md">
          <Button
            component={Link}
            href="/dashboard"
            size="lg"
            color="yellow"
            c="dark.9"
            fw={700}
            rightSection={<IconArrowRight size={20} />}
          >
            Go to Dashboard
          </Button>
          <Button
            component={Link}
            href="/t/new"
            size="lg"
            variant="default"
            leftSection={<IconPlayerPlay size={20} />}
          >
            Create Tournament
          </Button>
        </Group>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mt={50}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <ThemeIcon size="xl" radius="md" color="yellow" variant="light" mb="md">
            <IconTrophy size={28} />
          </ThemeIcon>
          <Text fw={700} size="lg" mb="xs">
            Multiple Formats
          </Text>
          <Text size="sm" c="dimmed">
            Swiss system, Round Robin (single/double), and Single Elimination Knockouts.
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <ThemeIcon size="xl" radius="md" color="yellow" variant="light" mb="md">
            <IconFlame size={28} />
          </ThemeIcon>
          <Text fw={700} size="lg" mb="xs">
            Rule-Based Pairings
          </Text>
          <Text size="sm" c="dimmed">
            Zero repeat pairings, balanced colors, strict float-down handling, and odd-player byes.
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <ThemeIcon size="xl" radius="md" color="yellow" variant="light" mb="md">
            <IconChartBar size={28} />
          </ThemeIcon>
          <Text fw={700} size="lg" mb="xs">
            Live Standings & Tiebreaks
          </Text>
          <Text size="sm" c="dimmed">
            Buchholz, Sonneborn-Berger, Direct Encounter, and Wins computed automatically in real-time.
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <ThemeIcon size="xl" radius="md" color="yellow" variant="light" mb="md">
            <IconUsers size={28} />
          </ThemeIcon>
          <Text fw={700} size="lg" mb="xs">
            Public Live Pages
          </Text>
          <Text size="sm" c="dimmed">
            No login needed for players and spectators. Live pairings, crosstables, and QR codes.
          </Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
