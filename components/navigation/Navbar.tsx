'use client';

import {
  Group,
  Button,
  Text,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
  Container,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
  IconTrophy,
  IconPlus,
} from '@tabler/icons-react';
import Link from 'next/link';

export function Navbar() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--mantine-color-default-border)',
        backgroundColor: 'var(--mantine-color-body)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Container size="lg" h={60}>
        <Group justify="space-between" h="100%">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Group gap="xs">
              <IconTrophy size={26} color="#ffd54f" />
              <Text fw={900} size="xl" c="var(--mantine-color-text)">
                Chess<Text component="span" c="yellow.5" inherit>Flow</Text>
              </Text>
            </Group>
          </Link>

          <Group gap="sm">
            <Button component={Link} href="/dashboard" variant="subtle" size="sm">
              Dashboard
            </Button>
            <Button
              component={Link}
              href="/t/new"
              color="yellow"
              c="dark.9"
              size="sm"
              fw={700}
              leftSection={<IconPlus size={16} />}
            >
              New Tournament
            </Button>
            <ActionIcon
              onClick={toggleColorScheme}
              variant="default"
              size="lg"
              aria-label="Toggle color scheme"
            >
              {computedColorScheme === 'dark' ? (
                <IconSun size={18} color="gold" />
              ) : (
                <IconMoon size={18} />
              )}
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </header>
  );
}
