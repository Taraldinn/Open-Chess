import {
  Container,
  Title,
  Text,
  Button,
  Group,
  SimpleGrid,
  Card,
  Badge,
  Stack,
  ActionIcon,
  Paper,
} from '@mantine/core';
import {
  IconPlus,
  IconTrophy,
  IconUsers,
  IconPlayerPlay,
  IconExternalLink,
  IconCalendar,
} from '@tabler/icons-react';
import Link from 'next/link';
import { getTournamentsAction } from '@/lib/actions/tournaments';

export const revalidate = 0;

export default async function DashboardPage() {
  const tournaments = await getTournamentsAction();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge color="green" variant="light">Running (Live)</Badge>;
      case 'registration':
        return <Badge color="blue" variant="light">Registration</Badge>;
      case 'finished':
        return <Badge color="gray" variant="light">Finished</Badge>;
      default:
        return <Badge color="yellow" variant="light">Draft</Badge>;
    }
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} size="2.2rem" fw={900}>
            Tournament Dashboard
          </Title>
          <Text c="dimmed">Manage your chess tournaments, pairings, and results</Text>
        </div>
        <Link href="/t/new" style={{ textDecoration: 'none' }}>
          <Button
            color="yellow"
            c="dark.9"
            fw={700}
            leftSection={<IconPlus size={18} />}
          >
            New Tournament
          </Button>
        </Link>
      </Group>

      {tournaments.length === 0 ? (
        <Paper p="xl" withBorder radius="md" ta="center" my={50}>
          <IconTrophy size={48} color="gold" style={{ margin: '0 auto 16px' }} />
          <Title order={3} mb="xs">
            No Tournaments Yet
          </Title>
          <Text c="dimmed" maw={500} mx="auto" mb="lg">
            Create your first Swiss, Round Robin, or Knockout tournament in less than 3 minutes.
          </Text>
          <Link href="/t/new" style={{ textDecoration: 'none' }}>
            <Button
              color="yellow"
              c="dark.9"
              fw={700}
              leftSection={<IconPlus size={18} />}
            >
              Create Tournament
            </Button>
          </Link>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {tournaments.map((t) => (
            <Card key={t.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                {getStatusBadge(t.status)}
                <Badge variant="outline" tt="uppercase" size="sm">
                  {t.format.replace(/_/g, ' ')}
                </Badge>
              </Group>

              <Title order={3} size="1.25rem" mb="xs">
                {t.name}
              </Title>

              <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                {t.description || 'No description'}
              </Text>

              <Stack gap="xs" mb="lg">
                <Group gap="xs">
                  <IconCalendar size={16} />
                  <Text size="xs" c="dimmed">
                    Rounds: {t.current_round} / {t.total_rounds}
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconTrophy size={16} />
                  <Text size="xs" c="dimmed">
                    {t.time_control || 'Standard Time Control'}
                  </Text>
                </Group>
              </Stack>

              <Group gap="xs" mt="auto">
                <Link href={`/t/${t.slug}/manage/players`} style={{ flex: 1, textDecoration: 'none' }}>
                  <Button
                    variant="light"
                    color="yellow"
                    size="xs"
                    fullWidth
                  >
                    Manage
                  </Button>
                </Link>
                <Link href={`/t/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <Button
                    variant="default"
                    size="xs"
                    rightSection={<IconExternalLink size={14} />}
                  >
                    Live Page
                  </Button>
                </Link>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
