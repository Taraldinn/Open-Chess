'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowDownWideNarrowIcon,
  Loader2Icon,
  MoreVerticalIcon,
  PlayIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon,
  UserCheckIcon,
  UserMinusIcon,
  UsersIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { notify } from '@/lib/notify';
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
  useEffect(() => {
    setPlayers(initialPlayers);
  }, [initialPlayers]);
  const [bulkModalOpened, setBulkModalOpened] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

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
        notify({
          title: 'Player Added',
          message: `${(res.player as any).name} added to tournament.`,
          color: 'green',
        });
        setTimeout(() => nameInputRef.current?.focus(), 50);
      }
    } catch (err: any) {
      notify({
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
      notify({
        title: res.newStatus === 'withdrawn' ? 'Player Withdrawn' : 'Player Re-activated',
        message: `${player.name} is now ${res.newStatus}.`,
        color: res.newStatus === 'withdrawn' ? 'orange' : 'green',
      });
    } catch (err: any) {
      notify({ title: 'Error', message: err.message, color: 'red' });
    }
  };

  const handleDeletePlayer = async (player: PlayerItem) => {
    try {
      await deletePlayerAction(player.id);
      setPlayers((prev) => prev.filter((p) => p.id !== player.id));
      notify({
        title: 'Player Removed',
        message: `${player.name} removed.`,
        color: 'gray',
      });
    } catch (err: any) {
      notify({ title: 'Error', message: err.message, color: 'red' });
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
    notify({
      title: 'Sorted by Rating',
      message: 'Seeds have been updated according to player ratings.',
      color: 'blue',
    });
  };

  const activeCount = players.filter((p) => p.status === 'active').length;

  return (
    <Card className="gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Tournament players</h2>
            <Badge variant="secondary">
              {players.length} registered ({activeCount} active)
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Add, reorder seeds, or import players. At least 2 active players required.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={sortByRating} disabled={players.length < 2}>
            <ArrowDownWideNarrowIcon />
            Sort by rating
          </Button>
          <Button variant="outline" onClick={() => setBulkModalOpened(true)}>
            <UploadIcon />
            Paste / CSV import
          </Button>
          <Button onClick={onStartTournament} disabled={activeCount < 2 || isStarting}>
            {isStarting ? <Loader2Icon className="animate-spin" /> : <PlayIcon />}
            {tournamentStatus === 'draft' ? 'Start tournament (gen round 1)' : 'Go to rounds'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/40 p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <SparklesIcon className="size-4" />
            Quick add player
          </div>
          <span className="text-xs text-muted-foreground">Press Enter in any field to add immediately</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1.5fr_auto]">
          <Input
            placeholder="Player name (e.g. Magnus Carlsen)"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            ref={nameInputRef}
          />
          <Input
            type="number"
            min={0}
            max={3500}
            placeholder="Rating (optional)"
            value={newRating}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setNewRating(v === '' ? '' : Number(v));
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
          />
          <Input
            placeholder="Club or country (optional)"
            value={newClub}
            onChange={(e) => setNewClub(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
          />
          <Button onClick={handleAddPlayer} disabled={!newName.trim() || loadingAdd}>
            {loadingAdd ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
            Add player
          </Button>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
          <UsersIcon className="size-10 text-muted-foreground" />
          <p className="font-semibold">No players added yet</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Add players one by one using the quick form above, or paste multiple players with the CSV
            importer.
          </p>
          <Button variant="outline" onClick={() => setBulkModalOpened(true)}>
            <UploadIcon />
            Open bulk / CSV import
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Seed</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Reorder</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((p, index) => (
              <TableRow key={p.id}>
                <TableCell className="font-bold">#{p.seed || index + 1}</TableCell>
                <TableCell className="font-semibold">{p.name}</TableCell>
                <TableCell>{p.rating || '-'}</TableCell>
                <TableCell>{p.club || '-'}</TableCell>
                <TableCell>
                  {p.status === 'active' ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Withdrawn</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => movePlayer(index, 'up')}
                    >
                      <ArrowUpIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move down"
                      disabled={index === players.length - 1}
                      onClick={() => movePlayer(index, 'down')}
                    >
                      <ArrowDownIcon />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label="Player actions" />}
                    >
                      <MoreVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => handleToggleWithdrawal(p)}>
                        {p.status === 'active' ? <UserMinusIcon /> : <UserCheckIcon />}
                        {p.status === 'active' ? 'Withdraw player' : 'Reactivate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => handleDeletePlayer(p)}>
                        <Trash2Icon />
                        Delete player
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
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
