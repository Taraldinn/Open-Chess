'use client';

import { useState, useEffect } from 'react';
import { Loader2Icon, PencilIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notify } from '@/lib/notify';
import { updatePlayerAction } from '@/lib/actions/players';
import type { PlayerItem } from './PlayerList';

interface EditPlayerModalProps {
  opened: boolean;
  onClose: () => void;
  player: PlayerItem | null;
  onSuccess: (updatedPlayer: PlayerItem) => void;
}

export function EditPlayerModal({
  opened,
  onClose,
  player,
  onSuccess,
}: EditPlayerModalProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [club, setClub] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (player) {
      setName(player.name || '');
      setRating(typeof player.rating === 'number' ? player.rating : '');
      setClub(player.club || '');
    }
  }, [player]);

  const handleSave = async () => {
    if (!player || !name.trim()) return;
    setLoading(true);

    try {
      const res = await updatePlayerAction({
        playerId: player.id,
        name: name.trim(),
        rating: typeof rating === 'number' ? rating : null,
        club: club.trim() || null,
      });

      if (res.success && res.player) {
        notify({
          title: 'Player Updated',
          message: `${name.trim()} details have been updated.`,
          color: 'green',
        });
        onSuccess({
          ...player,
          name: name.trim(),
          rating: typeof rating === 'number' ? rating : null,
          club: club.trim() || null,
        });
        onClose();
      }
    } catch (err: any) {
      notify({
        title: 'Update Failed',
        message: err.message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PencilIcon className="size-4" />
            </div>
            <DialogTitle>Edit Player</DialogTitle>
          </div>
          <DialogDescription>
            Update player name, rating, or club affiliation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="edit-player-name">Player Name</Label>
            <Input
              id="edit-player-name"
              placeholder="e.g. Magnus Carlsen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-player-rating">Rating (Optional)</Label>
            <Input
              id="edit-player-rating"
              type="number"
              min={0}
              max={3500}
              placeholder="e.g. 2850"
              value={rating}
              onChange={(e) => {
                const val = e.target.value;
                setRating(val === '' ? '' : Number(val));
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-player-club">Club / Country (Optional)</Label>
            <Input
              id="edit-player-club"
              placeholder="e.g. Norway / Offerspill"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || loading}>
            {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
