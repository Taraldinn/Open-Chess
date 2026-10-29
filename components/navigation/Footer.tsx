'use client';

import { Container, Group, Text, Button, Divider, Stack } from '@mantine/core';
import { IconBrandGithub, IconTrophy } from '@tabler/icons-react';

export const GITHUB_URL = 'https://github.com/Taraldinn';

export function Footer() {
  return (
    <footer style={{ paddingTop: '2rem', paddingBottom: '1.5rem' }}>
      <Divider mb="lg" color="var(--mantine-color-default-border)" />
      <Container size="lg">
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <IconTrophy size={18} color="#fcc419" />
              <Text fw={800}>
                Open<Text component="span" className="playful-gradient-text" inherit>VChess</Text>
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Swiss, Round Robin and Knockout tournaments with live pairings.
            </Text>
          </Stack>

          <Button
            component="a"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            size="xs"
            variant="default"
            leftSection={<IconBrandGithub size={14} />}
          >
            github.com/Taraldinn
          </Button>
        </Group>

        <Text size="xs" c="dimmed" ta="center" mt="lg">
          © {new Date().getFullYear()} OpenVChess · Built by{' '}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', fontWeight: 700 }}
          >
            Taraldinn
          </a>
        </Text>
      </Container>
    </footer>
  );
}
