'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowDownWideNarrowIcon,
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  MoreVerticalIcon,
  PencilIcon,
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
  togglePlayerCheckInAction,
  checkInAllAction,
} from '@/lib/actions/players';
import { BulkImportModal } from './BulkImportModal';
import { EditPlayerModal } from './EditPlayerModal';
import { useRouter } from 'next/navigation';

export interface PlayerItem {
  id: string;
  name: string;
  rating: number | null;
  club: string | null;
  seed: number | null;
  status: 'active' | 'withdrawn';
  checked_in?: boolean;
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
  const [editPlayer, setEditPlayer] = useState<PlayerItem | null>(null);
  const [filterCheckIn, setFilterCheckIn] = useState<'all' | 'checked_in' | 'pending'>('all');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // New Player Form
  const [newName, setNewName] = useState('');
  const [newRating, setNewRating] = useState<number | ''>('');
  const [newClub, setNewClub] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  const handleToggleCheckIn = async (player: PlayerItem) => {
    const targetState = !Boolean(player.checked_in);
    // Optimistic update
    setPlayers((prev) =>
      prev.map((p) => (p.id === player.id ? { ...p, checked_in: targetState } : p))
    );

    try {
      await togglePlayerCheckInAction(player.id, targetState);
      notify({
        title: targetState ? 'Player Checked In' : 'Check-In Cleared',
        message: `${player.name} is now ${targetState ? 'checked in' : 'pending check-in'}.`,
        color: targetState ? 'green' : 'gray',
      });
    } catch (err: any) {
      // Revert optimistic update
      setPlayers((prev) =>
        prev.map((p) => (p.id === player.id ? { ...p, checked_in: !targetState } : p))
      );
      notify({ title: 'Error', message: err.message, color: 'red' });
    }
  };

  const handleCheckInAll = async (checkedIn: boolean) => {
    // Optimistic update
    setPlayers((prev) =>
      prev.map((p) => (p.status === 'active' ? { ...p, checked_in: checkedIn } : p))
    );

    try {
      await checkInAllAction(tournamentId, checkedIn);
      notify({
        title: checkedIn ? 'All Players Checked In' : 'Check-Ins Cleared',
        message: checkedIn ? 'All active players are marked as checked in.' : 'Check-in statuses reset.',
        color: checkedIn ? 'green' : 'blue',
      });
    } catch (err: any) {
      notify({ title: 'Error', message: err.message, color: 'red' });
      router.refresh();
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

  const activePlayers = players.filter((p) => p.status === 'active');
  const activeCount = activePlayers.length;
  const checkedInCount = activePlayers.filter((p) => Boolean(p.checked_in)).length;
  const pendingCheckInCount = activeCount - checkedInCount;

  // Filter players for table display
  const displayedPlayers = players.filter((p) => {
    if (filterCheckIn === 'checked_in') return Boolean(p.checked_in) && p.status === 'active';
    if (filterCheckIn === 'pending') return !p.checked_in && p.status === 'active';
    return true;
  });

  return (
    <Card className="gap-5 p-4 sm:p-6">
      {/* Top Header & Main Controls */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Tournament players</h2>
            <Badge variant="secondary">
              {players.length} registered ({activeCount} active)
            </Badge>
            <Badge
              variant="outline"
              className={checkedInCount > 0 ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400' : ''}
            >
              {checkedInCount} / {activeCount} checked in
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Edit player names &amp; clubs, manage check-ins, reorder seeds, or import players.
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

      {/* Check-In Bar & Batch Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground uppercase tracking-wide">Filter list:</span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={filterCheckIn === 'all' ? 'default' : 'ghost'}
              className="h-7 text-xs"
              onClick={() => setFilterCheckIn('all')}
            >
              All ({players.length})
            </Button>
            <Button
              size="sm"
              variant={filterCheckIn === 'checked_in' ? 'default' : 'ghost'}
              className="h-7 text-xs"
              onClick={() => setFilterCheckIn('checked_in')}
            >
              Checked In ({checkedInCount})
            </Button>
            <Button
              size="sm"
              variant={filterCheckIn === 'pending' ? 'default' : 'ghost'}
              className="h-7 text-xs"
              onClick={() => setFilterCheckIn('pending')}
            >
              Pending ({pendingCheckInCount})
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs"
            onClick={() => handleCheckInAll(true)}
            disabled={activeCount === 0 || checkedInCount === activeCount}
          >
            <CheckCircle2Icon className="size-3.5 text-emerald-500" />
            Check In All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => handleCheckInAll(false)}
            disabled={checkedInCount === 0}
          >
            Clear Check-Ins
          </Button>
        </div>
      </div>

      {/* Quick Add Player Form */}
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

      {/* Players Table */}
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
      ) : displayedPlayers.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          No players match the current check-in filter ({filterCheckIn.replace('_', ' ')}).
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Seed</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Reorder</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedPlayers.map((p, index) => (
              <TableRow key={p.id}>
                <TableCell className="font-bold">#{p.seed || index + 1}</TableCell>
                <TableCell className="font-semibold">
                  <div className="flex items-center gap-2">
                    <span>{p.name}</span>
                    <button
                      type="button"
                      onClick={() => setEditPlayer(p)}
                      title="Edit player name &amp; club"
                      className="text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                  </div>
                </TableCell>
                <TableCell>{p.rating || '-'}</TableCell>
                <TableCell>{p.club || '-'}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleToggleCheckIn(p)}
                    className="inline-flex cursor-pointer items-center rounded-md transition-colors"
                    title={p.checked_in ? 'Click to mark not checked in' : 'Click to check in'}
                  >
                    {p.checked_in ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <CheckCircle2Icon className="size-3" />
                        Checked In
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 text-muted-foreground hover:bg-muted"
                      >
                        <CircleIcon className="size-3" />
                        Check In
                      </Badge>
                    )}
                  </button>
                </TableCell>
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
                      disabled={index === displayedPlayers.length - 1}
                      onClick={() => movePlayer(index, 'down')}
                    >
                      <ArrowDownIcon />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit player"
                      onClick={() => setEditPlayer(p)}
                      title="Edit player"
                    >
                      <PencilIcon className="size-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" aria-label="Player actions" />}
                      >
                        <MoreVerticalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setEditPlayer(p)}>
                          <PencilIcon className="size-3.5 mr-2" />
                          Edit name &amp; club
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleCheckIn(p)}>
                          <CheckCircle2Icon className="size-3.5 mr-2" />
                          {p.checked_in ? 'Clear check-in' : 'Check in player'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleWithdrawal(p)}>
                          {p.status === 'active' ? (
                            <UserMinusIcon className="size-3.5 mr-2" />
                          ) : (
                            <UserCheckIcon className="size-3.5 mr-2" />
                          )}
                          {p.status === 'active' ? 'Withdraw player' : 'Reactivate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => handleDeletePlayer(p)}>
                          <Trash2Icon className="size-3.5 mr-2" />
                          Delete player
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Player Modal */}
      <EditPlayerModal
        opened={Boolean(editPlayer)}
        onClose={() => setEditPlayer(null)}
        player={editPlayer}
        onSuccess={(updated) => {
          setPlayers((prev) =>
            prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
          );
        }}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        opened={bulkModalOpened}
        onClose={() => setBulkModalOpened(false)}
        tournamentId={tournamentId}
        onSuccess={() => router.refresh()}
      />
    </Card>
  );
}
