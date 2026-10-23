'use client';

import { Container, Group, Text, Button, Badge, Divider, Stack, Box } from '@mantine/core';
import { IconBrandGithub, IconMail, IconHeart, IconTrophy } from '@tabler/icons-react';

export function Footer() {
  return (
    <footer style={{ marginTop: 'auto', paddingTop: '3rem', paddingBottom: '2.5rem' }}>
      <Divider mb="xl" color="var(--mantine-color-default-border)" />
      <Container size="lg">
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <Box className="playful-float">
                <IconTrophy size={20} color="#fab005" />
              </Box>
              <Text fw={800} size="md">
                Open<Text component="span" className="playful-gradient-text" inherit>VChess</Text>
              </Text>
              <Badge size="sm" variant="light" color="yellow" radius="xl">
                v0.1.0
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">
              Run Swiss, Round Robin, and Knockout tournaments with real-time pairings.
            </Text>
          </Stack>

          <Stack gap="xs" align="flex-end">
            <Group gap="xs" align="center">
              <Text size="sm" fw={600} c="dimmed">
                Crafted with{' '}
                <Text component="span" c="#ff4d6d" inherit style={{ display: 'inline-block' }}>
                  💛
                </Text>{' '}
                by <strong style={{ color: 'var(--mantine-color-text)' }}>taraldinn</strong>
              </Text>
            </Group>

            <Group gap="xs">
              <Button
                component="a"
                href="https://github.com/taraldinn"
                target="_blank"
                rel="noopener noreferrer"
                size="xs"
                variant="default"
                radius="xl"
                leftSection={<IconBrandGithub size={14} />}
              >
                GitHub
              </Button>
              <Button
                component="a"
                href="mailto:kferdoush617@gmail.com"
                size="xs"
                variant="light"
                color="yellow"
                radius="xl"
                leftSection={<IconMail size={14} />}
              >
                Email
              </Button>
            </Group>
          </Stack>
        </Group>

        <Group justify="center" mt="xl">
          <Text size="xs" c="dimmed">
            © {new Date().getFullYear()} OpenVChess • Open source chess tournament platform
          </Text>
        </Group>
      </Container>
    </footer>
  );
}
