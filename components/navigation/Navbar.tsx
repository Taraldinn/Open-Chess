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
  Drawer,
  Stack,
  Burger,
  Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSun,
  IconMoon,
  IconTrophy,
  IconPlus,
  IconLayoutDashboard,
} from '@tabler/icons-react';
import Link from 'next/link';
import { UserMenu } from './UserMenu';

export function Navbar() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
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
                  <IconTrophy size={26} color="#fab005" />
                </Box>
                <Text fw={900} size="lg" c="var(--mantine-color-text)" style={{ letterSpacing: '-0.02em' }}>
                  Open<Text component="span" className="playful-gradient-text" inherit>VChess</Text>
                </Text>
              </Group>
            </Link>

            {/* Desktop nav */}
            <Group gap="sm" visibleFrom="sm">
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button variant="subtle" size="sm" radius="xl" className="subtle-nav-btn">
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

            {/* Mobile nav */}
            <Group gap="xs" hiddenFrom="sm">
              <ActionIcon
                onClick={toggleColorScheme}
                variant="default"
                size="md"
                radius="xl"
                aria-label="Toggle color scheme"
              >
                {computedColorScheme === 'dark' ? (
                  <IconSun size={16} color="#ffd43b" />
                ) : (
                  <IconMoon size={16} color="#7950f2" />
                )}
              </ActionIcon>
              <UserMenu />
              <Burger
                opened={drawerOpened}
                onClick={drawerOpened ? closeDrawer : openDrawer}
                size="sm"
                aria-label="Toggle navigation"
              />
            </Group>
          </Group>
        </Container>
      </header>

      {/* Mobile drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={
          <Group gap="xs">
            <IconTrophy size={20} color="#fab005" />
            <Text fw={900} size="md">OpenVChess</Text>
          </Group>
        }
        position="right"
        size="xs"
        zIndex={200}
      >
        <Stack gap="sm" pt="md">
          <Link href="/dashboard" style={{ textDecoration: 'none' }} onClick={closeDrawer}>
            <Button
              variant="light"
              color="yellow"
              fullWidth
              leftSection={<IconLayoutDashboard size={16} />}
              fw={700}
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/t/new" style={{ textDecoration: 'none' }} onClick={closeDrawer}>
            <Button
              color="yellow"
              c="dark.9"
              fullWidth
              leftSection={<IconPlus size={16} stroke={2.5} />}
              fw={800}
            >
              New Tournament
            </Button>
          </Link>
          <Divider />
          <Link href="/" style={{ textDecoration: 'none' }} onClick={closeDrawer}>
            <Button variant="subtle" fullWidth fw={600}>
              Home
            </Button>
          </Link>
        </Stack>
      </Drawer>
    </>
  );
}
