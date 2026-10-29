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
  Box,
} from '@mantine/core';
import {
  IconPlus,
  IconTrophy,
  IconUsers,
  IconPlayerPlay,
  IconExternalLink,
  IconCalendar,
  IconSparkles,
} from '@tabler/icons-react';
import Link from 'next/link';
import { getTournamentsAction } from '@/lib/actions/tournaments';

export const revalidate = 0;

export default async function DashboardPage() {
  const tournaments = await getTournamentsAction();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <Badge color="green" variant="filled" size="md">
            Live
          </Badge>
        );
      case 'registration':
        return (
          <Badge color="arcadeViolet" variant="light" size="md">
            Registration
          </Badge>
        );
      case 'finished':
        return (
          <Badge color="gray" variant="light" size="md">
            Finished
          </Badge>
        );
      default:
        return (
          <Badge color="yellow" variant="light" size="md">
            Draft
          </Badge>
        );
    }
  };

  return (
    <Container size="lg" py={{ base: 'md', sm: 'xl' }}>
      <Group justify="space-between" mb="xl" wrap="wrap" gap="sm" align="flex-end">
        <div>
          <Title order={1} fw={900} style={{ letterSpacing: '-0.02em', fontSize: 'clamp(1.5rem, 4vw, 1.8rem)' }}>
            Dashboard
          </Title>
          <Text c="dimmed" size="sm">
            Manage your chess tournaments, pairings, and results
          </Text>
        </div>
        <Link href="/t/new" style={{ textDecoration: 'none' }}>
          <Button
            color="yellow"
           
            fw={800}
            size="md"
            radius="sm"
            leftSection={<IconPlus size={18} stroke={2.5} />}
            className="playful-card-glow"
          >
            New Tournament
          </Button>
        </Link>
      </Group>

      {tournaments.length === 0 ? (
        <Paper p="1.5rem" withBorder radius="sm" ta="center" my={50} className="playful-card-glow">
          <Box className="playful-float" mb="md">
            <IconTrophy size={56} color="var(--accent)" />
          </Box>
          <Title order={3} mb="xs" fw={800}>
            No Tournaments Yet!
          </Title>
          <Text c="dimmed" maw={500} mx="auto" mb="xl" size="md">
            Ready to host your next chess showdown? Create your first Swiss, Round Robin, or Knockout event in under 3 minutes.
          </Text>
          <Link href="/t/new" style={{ textDecoration: 'none' }}>
            <Button
              color="yellow"
             
              fw={800}
              size="sm"
              radius="sm"
              leftSection={<IconPlus size={20} stroke={2.5} />}
              className="playful-card-glow"
            >
              Create Tournament
            </Button>
          </Link>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {tournaments.map((t) => (
            <Card key={t.id} shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                {getStatusBadge(t.status)}
                <Badge variant="outline" color="yellow" size="sm">
                  {t.format.replace(/_/g, ' ')}
                </Badge>
              </Group>

              <Title order={3} size="1.3rem" mb="xs" fw={800}>
                {t.name}
              </Title>

              <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                {t.description || 'No description provided'}
              </Text>

              <Stack gap="xs" mb="lg">
                <Group gap="xs">
                  <IconCalendar size={16} color="var(--accent)" />
                  <Text size="xs" c="dimmed" fw={500}>
                    Rounds: {t.current_round} / {t.total_rounds}
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconTrophy size={16} color="var(--mantine-color-coral-5)" />
                  <Text size="xs" c="dimmed" fw={500}>
                    {t.time_control || 'Standard Time Control'}
                  </Text>
                </Group>
              </Stack>

              <Group gap="xs" mt="auto">
                <Link href={`/t/${t.slug}/manage/players`} style={{ flex: 1, textDecoration: 'none' }}>
                  <Button
                    variant="light"
                    color="yellow"
                    size="sm"
                    radius="sm"
                    fullWidth
                    fw={700}
                  >
                    Manage
                  </Button>
                </Link>
                <Link href={`/t/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <Button
                    variant="default"
                    size="sm"
                    radius="sm"
                    fw={600}
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
