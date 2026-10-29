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
  IconBrandGithub,
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
          <Group justify="space-between" h="100%" wrap="nowrap">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Group gap="xs" align="center">
                <Box className="playful-float">
                  <IconTrophy size={26} color="var(--accent)" />
                </Box>
                <Text fw={900} size="md" c="var(--mantine-color-text)" style={{ letterSpacing: '-0.02em' }}>
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
                 
                  size="sm"
                  radius="xl"
                  fw={800}
                  leftSection={<IconPlus size={16} stroke={2.5} />}
                >
                  New Tournament
                </Button>
              </Link>
              <ActionIcon
                component="a"
                href="https://github.com/Taraldinn"
                target="_blank"
                rel="noopener noreferrer"
                variant="default"
                size="lg"
                radius="xl"
                aria-label="GitHub: Taraldinn"
              >
                <IconBrandGithub size={20} />
              </ActionIcon>
              <UserMenu />
              <ActionIcon
                onClick={toggleColorScheme}
                variant="default"
                size="lg"
                radius="xl"
                aria-label="Toggle color scheme"
              >
                <>
                  <IconSun size={20} className="icon-show-dark" />
                  <IconMoon size={20} className="icon-show-light" />
                </>
              </ActionIcon>
            </Group>

            {/* Mobile nav */}
            <Group gap={6} hiddenFrom="sm" wrap="nowrap">
              <ActionIcon
                onClick={toggleColorScheme}
                variant="default"
                size="md"
                radius="xl"
                aria-label="Toggle color scheme"
              >
                <>
                  <IconSun size={16} className="icon-show-dark" />
                  <IconMoon size={16} className="icon-show-light" />
                </>
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
            <IconTrophy size={20} color="var(--accent)" />
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
          <Button
            component="a"
            href="https://github.com/Taraldinn"
            target="_blank"
            rel="noopener noreferrer"
            variant="default"
            fullWidth
            leftSection={<IconBrandGithub size={16} />}
          >
            github.com/Taraldinn
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
