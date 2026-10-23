'use client';

import { Group, Title, Badge, Tabs, Button, Text } from '@mantine/core';
import {
  IconUsers,
  IconFlame,
  IconSettings,
  IconExternalLink,
  IconArrowLeft,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
  name: string;
  slug: string;
  format: string;
  status: string;
  currentRound: number;
  totalRounds: number;
}

export function TournamentManageHeader({
  name,
  slug,
  format,
  status,
  currentRound,
  totalRounds,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = () => {
    if (pathname.includes('/manage/rounds')) return 'rounds';
    if (pathname.includes('/manage/settings')) return 'settings';
    return 'players';
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Group justify="space-between" mb="xs">
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconArrowLeft size={14} />}
          >
            All Tournaments
          </Button>
        </Link>
        <Link href={`/t/${slug}`} target="_blank" style={{ textDecoration: 'none' }}>
          <Button
            variant="default"
            size="xs"
            rightSection={<IconExternalLink size={14} />}
          >
            Public Live Link
          </Button>
        </Link>
      </Group>

      <Group justify="space-between" align="flex-start" mb="md">
        <div>
          <Group gap="xs">
            <Title order={2} size="1.8rem" fw={800}>
              {name}
            </Title>
            <Badge color="yellow" variant="light" size="lg" tt="uppercase">
              {format.replace(/_/g, ' ')}
            </Badge>
            <Badge
              color={status === 'running' ? 'green' : status === 'finished' ? 'gray' : 'blue'}
              size="lg"
            >
              {status.toUpperCase()}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            Round: {currentRound} of {totalRounds}
          </Text>
        </div>
      </Group>

      <Tabs
        value={getActiveTab()}
        onChange={(val) => router.push(`/t/${slug}/manage/${val}`)}
        color="yellow"
      >
        <Tabs.List>
          <Tabs.Tab value="players" leftSection={<IconUsers size={16} />}>
            Players
          </Tabs.Tab>
          <Tabs.Tab value="rounds" leftSection={<IconFlame size={16} />}>
            Rounds & Results
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </div>
  );
}
