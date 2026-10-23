'use client';

import {
  Group,
  Button,
  Text,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
  Container,
  Box,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
  IconTrophy,
  IconPlus,
} from '@tabler/icons-react';
import Link from 'next/link';
import { UserMenu } from './UserMenu';

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
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container size="lg" h={64}>
        <Group justify="space-between" h="100%">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Group gap="xs" align="center">
              <Box className="playful-float">
                <IconTrophy size={28} color="#fab005" />
              </Box>
              <Text fw={900} size="xl" c="var(--mantine-color-text)" style={{ letterSpacing: '-0.02em' }}>
                Chess<Text component="span" className="playful-gradient-text" inherit>Flow</Text>
              </Text>
            </Group>
          </Link>

          <Group gap="sm">
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="subtle" size="sm" radius="xl">
                Dashboard
              </Button>
            </Link>
            <Link href="/t/new" style={{ textDecoration: 'none' }}>
              <Button
                color="yellow"
                c="dark.9"
                size="sm"
                radius="xl"
                fw={800}
                leftSection={<IconPlus size={16} stroke={2.5} />}
              >
                New Tournament
              </Button>
            </Link>
            <UserMenu />
            <ActionIcon
              onClick={toggleColorScheme}
              variant="default"
              size="lg"
              radius="xl"
              aria-label="Toggle color scheme"
            >
              {computedColorScheme === 'dark' ? (
                <IconSun size={20} color="#ffd43b" />
              ) : (
                <IconMoon size={20} color="#7950f2" />
              )}
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </header>
  );
}
