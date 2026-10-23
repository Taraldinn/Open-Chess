'use client';

import { useState } from 'react';
import {
  Table,
  Button,
  Group,
  TextInput,
  NumberInput,
  Badge,
  ActionIcon,
  Text,
  Paper,
  Card,
  Menu,
  SimpleGrid,
  Tooltip,
} from '@mantine/core';
import {
  IconPlus,
  IconArrowUp,
  IconArrowDown,
  IconDotsVertical,
  IconTrash,
  IconUserMinus,
  IconUserCheck,
  IconSortDescendingNumbers,
  IconUpload,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  addPlayerAction,
  deletePlayerAction,
  togglePlayerWithdrawalAction,
  reorderPlayersAction,
} from '@/lib/actions/players';
import { BulkImportModal } from './BulkImportModal';
import { useRouter } from 'next/navigation';

export interface PlayerItem {
  id: string;
  name: string;
  rating: number | null;
  club: string | null;
  seed: number | null;
  status: 'active' | 'withdrawn';
}

interface PlayerListProps {
  tournamentId: string;
  tournamentSlug: string;
  tournamentStatus: string;
  currentRound: number;
  initialPlayers: PlayerItem[];
  onStartTournament: () => void;
  isStarting: boolean;
}

export function PlayerList({
  tournamentId,
  tournamentSlug,
  tournamentStatus,
  currentRound,
  initialPlayers,
  onStartTournament,
  isStarting,
}: PlayerListProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerItem[]>(initialPlayers);
  const [bulkModalOpened, setBulkModalOpened] = useState(false);

  // New Player Form
  const [newName, setNewName] = useState('');
  const [newRating, setNewRating] = useState<number | ''>('');
  const [newClub, setNewClub] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);

  const handleAddPlayer = async () => {
    if (!newName.trim()) return;
    setLoadingAdd(true);
    try {
      const res = await addPlayerAction({
        tournamentId,
        name: newName.trim(),
        rating: typeof newRating === 'number' ? newRating : null,
        club: newClub.trim() || null,
        seed: players.length + 1,
      });

      if (res.success && res.player) {
        setPlayers((prev) => [...prev, res.player as PlayerItem]);
        setNewName('');
        setNewRating('');
        setNewClub('');
        notifications.show({
          title: 'Player Added',
          message: `${(res.player as any).name} added to tournament.`,
          color: 'green',
        });
      }
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message,
        color: 'red',
      });
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleToggleWithdrawal = async (player: PlayerItem) => {
    try {
      const res = await togglePlayerWithdrawalAction(player.id, currentRound);
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === player.id
            ? { ...p, status: res.newStatus as 'active' | 'withdrawn' }
            : p
        )
      );
      notifications.show({
        title: res.newStatus === 'withdrawn' ? 'Player Withdrawn' : 'Player Re-activated',
        message: `${player.name} is now ${res.newStatus}.`,
        color: res.newStatus === 'withdrawn' ? 'orange' : 'green',
      });
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err.message, color: 'red' });
    }
  };

  const handleDeletePlayer = async (player: PlayerItem) => {
    try {
      await deletePlayerAction(player.id);
      setPlayers((prev) => prev.filter((p) => p.id !== player.id));
      notifications.show({
        title: 'Player Removed',
        message: `${player.name} removed.`,
        color: 'gray',
      });
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err.message, color: 'red' });
    }
  };

  const movePlayer = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= players.length) return;

    const reordered = [...players];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update seeds locally
    const updated = reordered.map((p, i) => ({ ...p, seed: i + 1 }));
    setPlayers(updated);

    // Sync to DB
    await reorderPlayersAction(tournamentId, updated.map((p) => p.id));
  };

  const sortByRating = async () => {
    const sorted = [...players].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const updated = sorted.map((p, i) => ({ ...p, seed: i + 1 }));
    setPlayers(updated);
    await reorderPlayersAction(tournamentId, updated.map((p) => p.id));
    notifications.show({
      title: 'Sorted by Rating',
      message: 'Seeds have been updated according to player ratings.',
      color: 'blue',
    });
  };

  const activeCount = players.filter((p) => p.status === 'active').length;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="lg">
        <div>
          <Group gap="xs">
            <Text fw={700} size="xl">
              Tournament Players
            </Text>
            <Badge color="yellow" variant="light">
              {players.length} Registered ({activeCount} Active)
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            Add, reorder seeds, or import players. At least 2 active players required.
          </Text>
        </div>

        <Group>
          <Button
            variant="default"
            leftSection={<IconSortDescendingNumbers size={16} />}
            onClick={sortByRating}
            disabled={players.length < 2}
          >
            Sort by Rating
          </Button>

          <Button
            variant="light"
            color="yellow"
            leftSection={<IconUpload size={16} />}
            onClick={() => setBulkModalOpened(true)}
          >
            Paste / CSV Import
          </Button>

          <Button
            color="yellow"
            c="dark.9"
            fw={700}
            leftSection={<IconPlayerPlay size={18} />}
            onClick={onStartTournament}
            loading={isStarting}
            disabled={activeCount < 2}
          >
            {tournamentStatus === 'draft' ? 'Start Tournament (Gen Round 1)' : 'Go to Rounds'}
          </Button>
        </Group>
      </Group>

      {/* Add Player Inline Form */}
      <Paper p="md" withBorder radius="md" mb="lg" bg="var(--mantine-color-dark-8)">
        <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="sm">
          <TextInput
            placeholder="Player Name (e.g. Magnus Carlsen)"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
          />
          <NumberInput
            placeholder="Rating (Optional)"
            min={0}
            max={3500}
            value={newRating}
            onChange={(v) => setNewRating(typeof v === 'number' ? v : '')}
          />
          <TextInput
            placeholder="Club or Country (Optional)"
            value={newClub}
            onChange={(e) => setNewClub(e.currentTarget.value)}
          />
          <Button
            color="yellow"
            c="dark.9"
            fw={600}
            onClick={handleAddPlayer}
            loading={loadingAdd}
            disabled={!newName.trim()}
            leftSection={<IconPlus size={16} />}
          >
            Add Player
          </Button>
        </SimpleGrid>
      </Paper>

      {/* Table */}
      {players.length === 0 ? (
        <Paper p="xl" ta="center" withBorder radius="md">
          <Text c="dimmed">No players added yet. Add players above or import a list.</Text>
        </Paper>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 60 }}>Seed</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th style={{ width: 100 }}>Rating</Table.Th>
              <Table.Th>Club</Table.Th>
              <Table.Th style={{ width: 100 }}>Status</Table.Th>
              <Table.Th style={{ width: 110 }}>Reorder</Table.Th>
              <Table.Th style={{ width: 60 }}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {players.map((p, index) => (
              <Table.Tr key={p.id}>
                <Table.Td fw={700}>#{p.seed || index + 1}</Table.Td>
                <Table.Td fw={600}>
                  {p.name}
                </Table.Td>
                <Table.Td>{p.rating || '-'}</Table.Td>
                <Table.Td>{p.club || '-'}</Table.Td>
                <Table.Td>
                  {p.status === 'active' ? (
                    <Badge color="green" size="sm" variant="light">
                      Active
                    </Badge>
                  ) : (
                    <Badge color="red" size="sm" variant="light">
                      Withdrawn
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => movePlayer(index, 'up')}
                    >
                      <IconArrowUp size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      disabled={index === players.length - 1}
                      onClick={() => movePlayer(index, 'down')}
                    >
                      <IconArrowDown size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Menu shadow="md" width={160} position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="sm">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={
                          p.status === 'active' ? (
                            <IconUserMinus size={14} />
                          ) : (
                            <IconUserCheck size={14} />
                          )
                        }
                        onClick={() => handleToggleWithdrawal(p)}
                      >
                        {p.status === 'active' ? 'Withdraw Player' : 'Reactivate'}
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => handleDeletePlayer(p)}
                      >
                        Delete Player
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <BulkImportModal
        opened={bulkModalOpened}
        onClose={() => setBulkModalOpened(false)}
        tournamentId={tournamentId}
        onSuccess={() => router.refresh()}
      />
    </Card>
  );
}
