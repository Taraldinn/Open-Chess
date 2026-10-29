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
      <Group justify="space-between" mb="xs" wrap="wrap" gap="xs">
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Button
            variant="subtle"
            size="xs"
            className="subtle-nav-btn"
            leftSection={<IconArrowLeft size={14} />}
          >
            Back
          </Button>
        </Link>
        <Link href={`/t/${slug}`} target="_blank" style={{ textDecoration: 'none' }}>
          <Button
            variant="default"
            size="xs"
            radius="sm"
            rightSection={<IconExternalLink size={14} />}
          >
            Public Link
          </Button>
        </Link>
      </Group>

      <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
        <div style={{ minWidth: 0, flex: 1 }}>
          <Title order={2} fw={900} mb={4} style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)' }}>
            {name}
          </Title>
          <Group gap="xs" wrap="wrap">
            <Badge color="yellow" variant="filled" size="sm" tt="uppercase">
              {format.replace(/_/g, ' ')}
            </Badge>
            <Badge
              color={status === 'running' ? 'green' : status === 'finished' ? 'gray' : 'arcadeViolet'}
              variant="light"
              size="sm"
            >
              {status === 'draft' ? 'DRAFT' : status === 'running' ? 'LIVE' : status.toUpperCase()}
            </Badge>
            <Text size="sm" c="dimmed">
              Round {currentRound} / {totalRounds}
            </Text>
          </Group>
        </div>
      </Group>

      <Tabs
        value={getActiveTab()}
        onChange={(val) => router.push(`/t/${slug}/manage/${val}`)}
        color="yellow"
        variant="pills"
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
