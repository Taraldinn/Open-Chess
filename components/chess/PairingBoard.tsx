'use client';

import type { GameResult } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ResultButtons } from './ResultButtons';
import { ColorChip } from './ColorChip';

export interface BoardGameItem {
  id: string;
  board: number;
  whiteId: string | null;
  blackId: string | null;
  result: GameResult;
  whitePlayer?: { name: string; rating: number | null; club: string | null } | null;
  blackPlayer?: { name: string; rating: number | null; club: string | null } | null;
}

interface PairingBoardProps {
  game: BoardGameItem;
  disabled?: boolean;
  onSetResult: (gameId: string, result: GameResult) => void;
}

function PlayerRow({
  color,
  name,
  rating,
}: {
  color: 'white' | 'black';
  name: string;
  rating?: number | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[70px] shrink-0">
        <ColorChip color={color} />
      </div>
      <p className="min-w-0 break-words text-sm font-semibold">
        {name}
        {rating ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">({rating})</span> : null}
      </p>
    </div>
  );
}

export function PairingBoard({ game, disabled, onSetResult }: PairingBoardProps) {
  const isBye = game.result === 'bye' || game.blackId === null;
  const isFinished = game.result !== 'unplayed';

  return (
    <Card className={cn('flex-row flex-wrap items-start justify-between gap-4 p-4', isFinished && 'bg-muted/50')}>
      <div className="flex min-w-[220px] flex-1 flex-col gap-2">
        <Badge variant={isFinished ? 'secondary' : 'default'}>Board {game.board}</Badge>
        <PlayerRow color="white" name={game.whitePlayer?.name || 'Unknown'} rating={game.whitePlayer?.rating} />
        {isBye ? (
          <Badge variant="outline">BYE</Badge>
        ) : (
          <PlayerRow color="black" name={game.blackPlayer?.name || 'Unknown'} rating={game.blackPlayer?.rating} />
        )}
      </div>
      <ResultButtons
        currentResult={game.result}
        isBye={isBye}
        disabled={disabled}
        onSetResult={(res) => onSetResult(game.id, res)}
      />
    </Card>
  );
}
